# Donor class - donation data for parties by give date
class Donation
  include Mongoid::Document
  include Mongoid::Timestamps

  belongs_to :donorset
  embedded_in :donor

  after_create :trigger_party_calculate_donation_total_amount
  before_destroy :trigger_party_calculate_donation_total_amount

  field :amount, type: Float
  field :party_id, type: BSON::ObjectId
  field :give_date, type: Date
  field :comment, type: String
  field :monetary, type: Boolean, default: true
  field :md5, type: String # md5 string from donor and donation info, for comparison ease

  # indexes
  index({ md5: 1 }, { unique: true })

  validates_presence_of :amount, :party_id, :give_date#, :donorset_id

  # scope :from_date, -> (v) { where("give_date >= ?", v) if v.present? }
  # scope :to_date, -> (v) { where("give_date <= ?", v) if v.present? }
  # scope :from_amount, -> (v) { where("amount >= ?", v) if v.present? }
  # scope :to_amount, -> (v) { where("amount <= ?", v) if v.present? }
  # scope :by_type, -> { where(:comment => "არაფულადი") }

  def trigger_party_calculate_donation_total_amount
    Party.calculate_donation_total_amount(party_id)
  end

  def self.sorted
    order_by([[:give_date, :desc]])
  end
  def self.sorted_by_amount
    order_by([[:amount, :desc], [:give_date, :desc]])
  end

  def party
    p = Party.find(party_id)
    p.present? ? p.title : "Unknown"
  end
  def donorset
    p = Donorset.find(donorset_id)
    p.present? ? p.title : "Unknown"
  end
end
