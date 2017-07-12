# Party class - meta information about parties
class Party
  include Mongoid::Document
  include Mongoid::Timestamps
  include Mongoid::Slug

#constants
  TYPES = [:party, :initiative]

#fields
  field :name, type: Array
  field :title, type: String, localize: true
  field :description, type: String, localize: true
  field :color, type: String, default: "##{SecureRandom.hex(3)}"
  field :tmp_id, type: Integer
  field :type, type: Integer, default: 0 # 0 - party, 1 - initiative
  field :member, type: Boolean, default: false
  field :leader, type: String, localize: true
#slug
  slug :title, history: true, localize: true

#indexes
  index ({ :title => 1})
  index ({ :name => 1})
  index ({ :type => 1})
  index({_slugs: 1}, { unique: true, sparse: false })
#validation
  validate :validate_translations
  validates_presence_of :color, :name
  validates_inclusion_of :type, in: [0, 1]

  def validate_translations
    default = I18n.default_locale
    locales = [:ka, :en, :ru]
    ["title_translations", "description_translations"].each{|f|
      if self.send(f)[default].blank?
        errors.add(:base, I18n.t('mongoid.errors.messages.validations.default_translation_missing',
          field: self.class.human_attribute_name(f),
          lang: Language.name_by_locale(default)))
      end
    }
  end

  def permalink
    id.to_s #slug.present? ? slug : id.to_s
  end
#scopes
  def self.sorted
    order_by([[:title, :asc]])#.limit(3)
  end
  def self.members # only parties that was set to be visible on explore/party finance page
    where({member: true})
  end

  def self.only_parties # not initiatives
    where({type: 0})
  end

#scoped data
  def self.list
    sorted.map{|t| [t.permalink, t.title]}.sort{|x,y| x[1] <=> y[1] } # used while creating list in view
  end

  def self.list_from(parties)
    parties.map{|t| [t[2], t[1]]}.sort{|x,y| x[1] <=> y[1] } # used while creating list in view
  end

  def self.for_collection
    sorted.map{|t| [t.title, t.id]}.sort{|x,y| x[0] <=> y[0] } # used while creating list in view
  end

  def self.member_party_list
    only_parties.members.sorted.map{|t| [t.permalink, t.title]}.sort{|x,y| x[1] <=> y[1] } # used while creating list in view
  end

#getters
  def self.get_ids_by_slugs(id_or_slugs)
    id_or_slugs = [] if !id_or_slugs.present?
    id_or_slugs = id_or_slugs.delete_if(&:blank?)
    if id_or_slugs.class == Array
      x = only(:_id, :_slugs).find(id_or_slugs)
      x.present? ? x.map{ |m| m[:_id].to_s } : []
    else
      []
    end
  end

  def self.clean_name(name)
    name.gsub!("მოქალაქეთა პოლიტიკური გაერთიანება","")
    name.gsub!("პოლიტიკური გაერთიანება","")
    name.gsub!("პოლიტიკური პარტია","")
    name.gsub!("მ.პ.გ.","")
    name.gsub!("მ,პ.გ.","")
    name.gsub!("მ.პ.გ","")
    name.gsub!("მ.პ. გ ","")
    name.gsub!("პ.გ.","")
    name.gsub!("პ.პ","")
    name.gsub!("ა.ა.ი.პ.","")
    name.gsub!("ა.ა.ი.პ","")
    name.gsub!("ა(ა)იპ","")
    name.gsub!("- ","")
    name.gsub!("  ","")
    name.gsub!("\"","")
    name.gsub!("სინიციატივო ჯგუფი","")
    name.gsub!("საინიციატივო ჯგუფი","")
    name.gsub!("საინიციატივოს ჯგუფი","")
    name.gsub!("საინიციატიცო ჯგუფი","")
    name.gsub!("საინიციაივო ჯგუფი","")
    name.gsub!("საინიციტივო ჯგუფი","")
    name.gsub!("საინციატივო ჯგუფი","")
    name.gsub!("საინიციატივო","")
    name.gsub!("შვილის","შვილი")

    return name.strip
  end

  def self.by_name(party_name, clean_require = true)
    party_name = Party.clean_name(party_name) if clean_require
    Party.or({ name: party_name }, { title: party_name }).first
  end

  def get_range
    "2017 - 2019"
  end

  def get_total(type)
    350000
  end
#field helpers
  def self.is_initiative(party_name)
    patterns = [
      "სინიციატივო ჯგუფი",
      "საინიციატივო ჯგუფი",
      "საინიციატივოს ჯგუფი",
      "საინიციატიცო ჯგუფი",
      "საინიციაივო ჯგუფი",
      "საინიციტივო ჯგუფი",
      "საინციატივო ჯგუფი",
      "საინიციატივო"
    ]
    is_initiative = false
    patterns.each {|d|
      is_initiative = true if party_name.include?(d)
    }
    is_initiative
  end

  def self.types
    col = {}
    TYPES.each_with_index{|d, i|
      col[I18n.t("mongoid.options.party.type.#{d}")] = i
    }
    col
  end

  def self.is_type(tp)
    begin
      tp.to_i < TYPES.length
    rescue
      false
    end
  end

  def self.type_is(tp)
    TYPES.index(tp.to_sym)
  end

end
