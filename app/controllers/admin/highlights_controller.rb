class Admin::HighlightsController < AdminController
  before_filter :authenticate_user!, only: [:create_or_update, :destroy]
  before_filter only: [:edit_description] do |controller_instance|
    controller_instance.send(:valid_role?, @data_editor_role)
  end
  before_filter do @model = Highlight; end

  def create_or_update
    pars = strong_params
    item = @model.find_by(base_id: pars[:base_id])
    item = @model.new(pars) if item.nil?
    # render json: { state: :destroy, message: t('shared.msgs.success_deleted', :obj => t('mongoid.models.highlight.one')) }
    respond_to do |format|
      format.json {
        if item.new_record?
          if item.save
            render json: { success: true, message: t('shared.msgs.success_created', :obj => t('mongoid.models.highlight.one')) }
          else
            render json: { success: false, message: I18n.t('shared.msgs.error_while_create') }
          end
        elsif request.post?
          if item.update_attributes(pars)
            render json: { success: true, message: t('shared.msgs.success_updated', :obj => t('mongoid.models.highlight.one')) }
          else
            render json: { success: false, message: I18n.t('shared.msgs.error_while_update') }
          end
        end
      }
    end

  end

  def destroy
    item = @model.find_by(base_id: params[:id])
    item.destroy
    render json: { success: true, message: t('shared.msgs.success_destroyed', :obj => t('mongoid.models.highlight.one')) }
  end

  private
    def strong_params
      params.require(:highlight).permit(:base_id, :locale, :home, description_translations: [:ka, :en, :ru])
    end
end
