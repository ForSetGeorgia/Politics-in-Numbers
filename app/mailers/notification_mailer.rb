class NotificationMailer < ActionMailer::Base
  default :from => ENV['APPLICATION_FEEDBACK_FROM_EMAIL']
  layout 'mailer'
  add_template_helper(ApplicationHelper)

  def about_donorset_file_process(msg)
    # puts "------------------------- #{msg.to_hash}"
    @message = msg
    mail(msg.to_hash.merge({:template_name => "common"})) if msg.valid?
  end

  def about_dataset_file_process(msg)
    # puts "------------------------- #{msg.to_hash}"
    @message = msg
    mail(msg.to_hash.merge({:template_name => "common"})) if msg.valid?
  end

  def donation_uploader(msg)
    # puts "------------------------- #{msg.to_hash}"
    @message = msg
    mail(msg.to_hash.merge({:template_name => "common"})) if msg.valid?
  end

end
