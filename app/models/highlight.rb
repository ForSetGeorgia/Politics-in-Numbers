class Highlight# < CustomTranslation
  include Mongoid::Document
  include Mongoid::Timestamps

  field :base_id, type: String
  field :description, type: String, localize: true

  index({base_id: 1}, { unique: true })

  def self.sid_highlighted?(sid)
    h = find_by(base_id: sid)
    h.present? ? h.description_translations : nil
  end

  def self.sort
    order_by([[:created_at, :desc]])
  end

end
