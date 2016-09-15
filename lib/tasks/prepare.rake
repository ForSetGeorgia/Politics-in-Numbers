namespace :prepare do # WARNING ondeploy
  desc "For each party set member flag "
  task :set_party_member_flag => :environment do |t, args|
    Party.each{|p|
      if p.tmp_id.present?
        p.member = true
        p.save
      end
    }
  end
  desc "For each donor save, for full_name to be filled"
  task :set_donor_full_name => :environment do |t, args|
    Donor.each{|p|
      p.save
    }
  end
  # WARNING call slug generator function for Category, Donor, Party, Period
end
