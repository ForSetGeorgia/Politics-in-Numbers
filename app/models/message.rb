class Message
  include Mongoid::Document
  include Mongoid::Timestamps

  #################################

  field :name, type: String
  field :to, type: String
  field :subject, type: String
  field :message, type: String
  # field :message_list, type: Array

  #attr_accessible :name, :email, :subject, :message, :bcc, :locale, :message_list

  # attr_accessor :bcc, :locale

  #################################
  ## Validation
#  validates_presence_of :email, :message => I18n.t('activerecord.errors.models.message.attributes.email.blank')
  validates_format_of :to, :with => /\A[-a-z0-9_+\.]+\@([-a-z0-9]+\.)+[a-z0-9]{2,4}\z/i
  validates_presence_of :message

  #################################
  ## Callbacks
  #after_initialize :set_locale
  before_validation :strip_whitespace

  # def set_locale
  #   self.locale = I18n.locale
  # end

  #################################
  def to_hash
    { subject: subject, message: message, to: to}
  end

private
  def strip_whitespace
    name.strip! if name.present?
    to.strip! if to.present?
    subject.strip! if subject.present?
    message.strip! if message.present?
    return true
  end
    # def _params
    #   pars = params.clone
    #   pars.require(:donorset).permit(:id, :party_id, :period_id, :source)
    # end

end
