class AdminController < ApplicationController
  before_filter :authenticate_user!
  # before_filter do |controller_instance|
  #   controller_instance.send(:valid_role?, @site_admin_role)
  # end

  def index
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @pages }
    end
  end

end
