namespace :uploader do
  desc "Start donation process: download and process"
  task :test => :environment do |t, args|

    lg, wrapper = init_logger('test')
    log(lg, wrapper.call("Donation file was already there, allowed only in development", 'warning'))
  #    # Donor.each {||}
    # prev_month = (Date.today.beginning_of_month - 1).beginning_of_month
    # from = ((prev_month - 1).beginning_of_month - 1).beginning_of_month # get first day of previous month, (current month first date minus 1).get first date
    # to = prev_month.end_of_month
    # Donor.donations_for_period(from, to)
    # Donor.each {|d|
    #   ids = []
    #   d.donations.each{|dd|
    #     if dd.give_date >= "01/01/2017".to_date #md5.present?
    #       # ids << dd.id.to_s
    #       dd.destroy
    #       # puts 'destroy'
    #       # puts "#{dd.md5}"
    #     end
    #   }
    #   # puts "#{ids} #{d.donations.where(id: ids).length.inspect}"
    #   # d.donations.where(id: ids).destroy_all if ids.present?
    # }
  end
  desc "Start donation process: download and process"
  task :start => :environment do |t, args|
     Rake::Task["uploader:download"].invoke
     Rake::Task["uploader:process"].invoke
  end
  desc "Download donations from http://monitoring.sao.ge and populate db if missing donations"
  task :download => :environment do |t, args|
    begin
      require 'csv'
      require 'open-uri'
      require 'rubyXL'
      lg, wrapper = init_logger('download')

      path = Rails.public_path.join("upload/sao")

      from, to = time_range(true)

      url = 'http://monitoring.sao.ge/results?draw=1&columns%5B0%5D%5Bdata%5D=politician.name&columns%5B0%5D%5Bname%5D=politician.name&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=true&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=date&columns%5B1%5D%5Bname%5D=date&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=donor.name&columns%5B2%5D%5Bname%5D=donor.person_name&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=donor.number&columns%5B3%5D%5Bname%5D=donor.person_id&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=verified_amount&columns%5B4%5D%5Bname%5D=verified_amount&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=donor.legal_form&columns%5B5%5D%5Bname%5D=donor.legal_form&columns%5B5%5D%5Bsearchable%5D=false&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=form_id&columns%5B6%5D%5Bname%5D=form_id&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=true&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bdata%5D=donor.name&columns%5B7%5D%5Bname%5D=donor.person_surname&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=true&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B8%5D%5Bdata%5D=donor.name&columns%5B8%5D%5Bname%5D=donor.legal_name&columns%5B8%5D%5Bsearchable%5D=true&columns%5B8%5D%5Borderable%5D=true&columns%5B8%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B8%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B9%5D%5Bdata%5D=donor.number&columns%5B9%5D%5Bname%5D=donor.legal_id&columns%5B9%5D%5Bsearchable%5D=true&columns%5B9%5D%5Borderable%5D=true&columns%5B9%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B9%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=2&order%5B0%5D%5Bdir%5D=desc&start=0&search%5Bvalue%5D=&search%5Bregex%5D=false&action=csv&from=_from_&to=_to_&l=0'
      url = url.gsub('_from_', from).gsub('_to_', to )

      file_name = "donations_#{Date.today.strftime("%Y-%m-%d")}"
      file_path = "#{path}/#{file_name}.csv"
      file_path_xlsx = "#{path}/donations_#{Date.today.strftime("%Y-%m-%d")}.xlsx"
      File.delete(file_path) if File.exists?(file_path)
      File.delete(file_path_xlsx) if File.exists?(file_path_xlsx)


      if File.exists?(file_path_xlsx)
        log(lg, wrapper.call("Donation file was already there, allowed only in development", 'warning'))
      else
        open(file_path, 'wb') do |f|
          f << open(url).read
        end

        csv_records_count = CSV.read(file_path, headers: true).count
        if csv_records_count > 0
          workbook = RubyXL::Workbook.new
          worksheet = workbook[0]

          row_i = 0
          CSV.foreach(file_path) do |row|
            row.each_with_index{|cell, cell_i|
              worksheet.add_cell(row_i, cell_i, cell)
            }
            row_i += 1
          end

          workbook.write(file_path_xlsx)

          zf = Zip::File.new(file_path_xlsx)

          File.delete(file_path) # remove csv

          # lg.info "File ready for upload, row number is: #{csv_records_count}"

        else
          log(lg, wrapper.call("File has no rows, try tommorow", 'error'))
        end
      end
    rescue => e
      log(lg, wrapper.call("#{e.inspect}#{e.backtrace}", 'exception'))
    ensure
      lg.close
    end

  end
  desc "Process donation records"
  task :process => :environment do |t, args|
    begin
      require 'rubyXL'

      lg, wrapper = init_logger('process')

      path = Rails.public_path.join("upload/sao")
      file_path_xlsx = "#{path}/donations_#{Date.today.strftime("%Y-%m-%d")}.xlsx"

      from, to = time_range

      donations = Donor.donations_for_period(from, to)
      # lg.info donations.length
      headers_map = [
        ["შემოწირულების მიმღები", "თარიღი", "სახელი, გვარი / დასახელება", "ნომერი / კოდი", "თანხა", "სამართლებრივი ფორმა", "შემოწირულების ტიპი"]
      ]
      header_versions = [1]

      ln = headers_map[0].length

      workbook = RubyXL::Parser.parse(file_path_xlsx)
      worksheet = workbook[0]
      is_header = true
      header_version = 1
      missing_parties = []
      st = Time.now

      worksheet.each_with_index { |row, row_i|
        if row && row.cells
          cells = []
          row.cells.each do |c|
            if c && c.value.present?
              cells << (c.value.class != String ? c.value : c.value.to_s.strip)
            end
          end

          if is_header
            if headers_map.any?{|hm| hm == cells }
              is_header = false
              header_version = header_versions[headers_map.index(cells)]
            end
          else
            obj = prepare_cells(cells, header_version)
            # lg.info "------#{obj.inspect}"
            break if obj.nil?

            p = Party.by_name(obj[:party], false)
            if p.class != Party
              lg.info "missing party #{obj[:party]}"
              p = Party.create!(name: [obj[:party]], title_translations: { ka: obj[:party], en: obj[:party].latinize.soft_titleize, ru: obj[:party].latinize.soft_titleize }, description: "საინიციატივო ჯგუფი #{obj[:party]}", tmp_id: -99, type: Party.type_is(:initiative))
              missing_parties << p._id
            end

            tmp_md5 = Digest::MD5.hexdigest([obj[:fname], obj[:lname], obj[:tin], obj[:date], obj[:amount], p._id, obj[:comment], !obj[:comment].include?("არაფულადი")].join("&"))


            if donations.any?{|s| s[:md5] == tmp_md5 }
              donations.delete_if{|s| s[:md5] == tmp_md5 }
            else
              donor = Donor.find_by( first_name: obj[:fname], last_name: obj[:lname], tin: obj[:tin])
              if !donor.present?
                lg.info "missing donor #{obj[:fname]} #{obj[:lname]} #{obj[:tin]}"
                donor = Donor.create!( first_name_translations: { ka: obj[:fname], en: obj[:fname].latinize.soft_titleize }, last_name_translations: { ka: obj[:lname] }.merge(obj[:lname].present? ? { en: obj[:lname].latinize.soft_titleize } : {}), tin: obj[:tin], nature: obj[:nature] ) # individual or organization
              end
              donor.donations.create!(give_date: obj[:date], amount: obj[:amount], party_id: p._id, comment: obj[:comment], monetary: !obj[:comment].include?("არაფულადი"), md5: tmp_md5 )
            end
          end
        end
      }

      # remove all that is not present anymore
      msg = []
      donations.each{|don|
        tmp_donor = Donor.find(don[:_id])
        tmp_donation = tmp_donor.donations.where(md5: don[:md5]).first
        msg << [tmp_donor.first_name, tmp_donor.last_name, tmp_donor.tin, tmp_donation.give_date, tmp_donation.amount, tmp_donation.party_id, tmp_donation.comment, tmp_donation.monetary].join("; ")
        tmp_donation.destroy
      }
      log(lg, wrapper.call("Removed donations \n" + msg.join("\n"), 'warning')) if donations.present?

      if is_header
        raise Exception.new(I18n.t("notifier.job.donation_uploader.unmatched_header", header: headers_map))
      else
        deffered = nil
        if missing_parties.present?
          deffered = Deffered.new( type: Deffered.type_is(:parties_type_correction), user_id: @user._id, related_ids: missing_parties )
          @user.deffereds << deffered
          @user.save
        end
        msg = I18n.t("notifier.job.donation_uploader.success",
          from: from,
          to: to,
          length: worksheet.count,
          missing_parties: deffered.present? ? I18n.t("notifier.job.donation_uploader.missing_parties", link: links[1].gsub("_id", deffered.id)) : ""
        )
        log(lg, wrapper.call(msg, 'success'))
      end

    rescue => e
      log(lg, wrapper.call(e.inspect, 'exception'))
    ensure
      lg.close
    end
  end

  def prepare_cells(cells, version)
    obj = {}
    return nil if cells[1].nil?
    if version == 1
      obj[:date] = cells[1]
      obj[:party] = Party.clean_name(cells[0])
      obj[:nature] = cells[5] == 'ფიზიკური პირი' ? 0 : 1

      if obj[:nature] == 0
        tmp = cells[2].split(' ')
        obj[:fname] = tmp[0]
        obj[:lname] = tmp[1]
      else
        obj[:fname] = cells[2]
        obj[:lname] = nil
      end
      obj[:tin] = cells[3]
      obj[:amount] = cells[4].gsub(',', '').to_f.round(2)

      obj[:comment] = cells[6].present? ? cells[6] : ""
    end
    return obj
  end

  def init_logger(prefix)
    log_path = "#{Rails.root}/log/tasks"
    FileUtils.mkpath(log_path)
    lg = Logger.new File.open("#{log_path}/uploader.log", 'a')
    lg.formatter = proc do |severity, datetime, progname, msg|
      "#{msg}\n"
    end

    wrapper = Proc.new do |msg,msg_type|
      mst_type = 'message' unless msg_type.present?
      "[#{Time.now.iso8601}][uploader:#{prefix}][#{msg_type}] - #{msg}"
    end

    [lg, wrapper]
  end
  def log(logger, msg)
    logger.info msg
    Notifier.donation_uploader msg
  end
  def n_months_back(n, first=true) # returns first day or last day of month that is n months back (first = true|false)
    tmp = Date.today.beginning_of_month
    while n != 0
      tmp = (tmp - 1).beginning_of_month
      n-=1
    end
    first ? tmp : tmp.end_of_month
  end
  def time_range(format=false)
    from = Time.parse('2017/1/1')
    to = n_months_back(0, false)

    [from, to].map{|m| format ? m.strftime("%Y-%m-%d") : m}
  end
end
