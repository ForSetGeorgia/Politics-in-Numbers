namespace :uploader do
  desc "Download donations from http://monitoring.sao.ge and populate db if missing donations"
  task :download => :environment do |t, args|
    require 'csv'
    require 'open-uri'
    require 'rubyXL'

    log_path = "#{Rails.root}/log/tasks"
    FileUtils.mkpath(log_path)
    lg = Logger.new File.open("#{log_path}/uploader.log", 'a')
    lg.formatter = proc do |severity, datetime, progname, msg|
      "[download][#{Time.now}] - #{msg}\n"
    end
    # test if previous month data was processed

    lg.info "---------------------------------------"
    path = Rails.public_path.join("upload/sao")
    now = Time.now


    from = (Date.today.beginning_of_month - 1).beginning_of_month # get first day of previous month, (current month first date minus 1).get first date
    to = from.end_of_month.strftime("%Y-%m-%d") # ex: '2017-06-30'
    from = from.strftime("%Y-%m-%d")
    lg.info "Range to check: #{from.inspect} - #{to.inspect}"
    # to =

    # from = '2016-11-01'
    url = 'http://monitoring.sao.ge/results?draw=1&columns%5B0%5D%5Bdata%5D=politician.name&columns%5B0%5D%5Bname%5D=politician.name&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=true&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=date&columns%5B1%5D%5Bname%5D=date&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=donor.name&columns%5B2%5D%5Bname%5D=donor.person_name&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=donor.number&columns%5B3%5D%5Bname%5D=donor.person_id&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=verified_amount&columns%5B4%5D%5Bname%5D=verified_amount&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=donor.legal_form&columns%5B5%5D%5Bname%5D=donor.legal_form&columns%5B5%5D%5Bsearchable%5D=false&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=form_id&columns%5B6%5D%5Bname%5D=form_id&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=true&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bdata%5D=donor.name&columns%5B7%5D%5Bname%5D=donor.person_surname&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=true&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B8%5D%5Bdata%5D=donor.name&columns%5B8%5D%5Bname%5D=donor.legal_name&columns%5B8%5D%5Bsearchable%5D=true&columns%5B8%5D%5Borderable%5D=true&columns%5B8%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B8%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B9%5D%5Bdata%5D=donor.number&columns%5B9%5D%5Bname%5D=donor.legal_id&columns%5B9%5D%5Bsearchable%5D=true&columns%5B9%5D%5Borderable%5D=true&columns%5B9%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B9%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=2&order%5B0%5D%5Bdir%5D=desc&start=0&search%5Bvalue%5D=&search%5Bregex%5D=false&action=csv&from=_from_&to=_to_&l=0'
    url = url.gsub('_from_', from).gsub('_to_', to )

    file_path = "#{path}/donations_#{from}_#{to}.csv"
    file_path_xlsx = "#{path}/donations_#{from}_#{to}.xlsx"
    if File.exists?(file_path_xlsx)
      lg.info 'File exists'
    else
      open(file_path, 'wb') do |f|
        f << open(url).read
      end

      if File.exists?(file_path)
        csv_records_count = CSV.read(file_path, headers: true).count
        if csv_records_count > 0
          # test if file needs to be uploaded
          # if yes upload
          # else stop process
          workbook = RubyXL::Workbook.new
          worksheet = workbook[0]

          row_i = 0
          CSV.foreach(file_path) do |row|
            row.each_with_index{|cell, cell_i|
              worksheet.add_cell(row_i, cell_i, cell)
            }
            row_i += 1
            # puts row.inspect
          end

          workbook.write(file_path_xlsx)

          File.delete(file_path) # remove csv
          # I18n.locale = :en

          # donorset = Donorset.new({ source: File.open(file_path) })
          # donorset.save
          # Job.donorset_file_process(donorset._id, User.all[0]._id)

          lg.info "File ready for upload, row number is: #{csv_records_count}"
        else
          lg.info "File has no rows, try tommorow"
        end
        # foreach(file_path, :headers => true) do |row|
        #   Moulding.create!(row.to_hash)
        # end
      else
        lg.info "File was not loaded: #{file_path}"
      end
    end
    lg.close
  end
end

