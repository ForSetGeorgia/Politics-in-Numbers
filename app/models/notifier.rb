class Notifier
  class << self
    def _about_dataset_file_process(msg, email)
      NotificationMailer.about_dataset_file_process(Message.new({subject: "Dataset processing message", message: msg, to: email})).deliver
    end
    handle_asynchronously :_about_dataset_file_process, :priority => 0

    def _about_donorset_file_process(msg, email)
      NotificationMailer.about_donorset_file_process(Message.new({subject: "Donorset processing message", message: msg, to: email})).deliver
    end
    handle_asynchronously :_about_donorset_file_process, :priority => 0
    def _donation_uploader(msg, email)
      NotificationMailer.donation_uploader(Message.new({subject: "PIN(#{Rails.env}) - Donation uploader message", message: msg, to: email})).deliver
    end
    handle_asynchronously :_donation_uploader, :priority => 0
  end

  def self.about_dataset_file_process(msg, user)
    Notifier._about_dataset_file_process(msg, (user.present? ? user.email : User.admin_email))
  end
  def self.about_donorset_file_process(msg, user)
    Notifier._about_donorset_file_process(msg, (user.present? ? user.email : User.admin_email))
  end
  def self.donation_uploader(msg)
    Notifier._donation_uploader(msg, ENV['APPLICATION_FEEDBACK_TO_EMAIL'])
  end
end
