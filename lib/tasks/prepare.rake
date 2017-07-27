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
  task :reset_slugs => :environment do |t, args|
    Donor.each { |p|
      p.unset_slug!
      p.save
    }
    Party.each { |p|
      p.unset_slug!
      p.save
    }
    Period.each { |p|
      p.unset_slug!
      p.save
    }
    Category.each { |p|
      p.unset_slug!
      p.save
    }
  end

  desc "Create sequence collection used by shortener"
  task :create_sequence_collection => :environment do |t, args|
    db = Mongoid.default_client
    db.command({ create: "sequence" })
  end

  desc "Drop sequence collection used by shortener"
  task :drop_sequence_collection => :environment do |t, args|
    db = Mongoid.default_client
    s = db.command({ listCollections: 1, filter: { name: "sequence" }  })
    db.command({ drop: "sequence" }) if s.documents[0]["cursor"]["firstBatch"].present?
    #
  end

  desc "Create sequence document for explore, embed_static and party used by shortener"
  task :populate_sequence => :environment do |t, args|
    db = Mongoid.default_client
    db.command({ insert: "sequence", documents: [ { _id: "explore_id", seq: 1000000000000000000 } ] })
    db.command({ insert: "sequence", documents: [ { _id: "embed_static_id", seq: 2000000000000000000 } ] })
    db.command({ insert: "sequence", documents: [ { _id: "party_id", seq: 3000000000000000000 } ] })
  end

  desc "Recreate sequence collection and document for explore and embed_static used by shortener"
  task :resequence => :environment do |t, args|
    Rake::Task["prepare:drop_sequence_collection"].invoke
    Rake::Task["prepare:create_sequence_collection"].invoke
    Rake::Task["prepare:populate_sequence"].invoke
  end

  desc "Truncate ShortUri and recreate explore and embed_static sequence"
  task :reset_shorturi => :environment do |t, args|
    ShortUri.destroy_all
    Rake::Task["db:mongoid:remove_undefined_indexes"].invoke
    Rake::Task["prepare:resequence"].invoke
  end
  # WARNING call slug generator function for Category, Donor, Party, Period

  desc "Create sequence document for party used by shortener"
  task :populate_party_sequence => :environment do |t, args|
    db = Mongoid.default_client
    db.command({ insert: "sequence", documents: [ { _id: "party_id", seq: 3000000000000000000 } ] })
  end

  # was created after Party.on_default field was added, to indicate which parties should participate in filtering if no party is selected
  desc "Set default parties while exploring data"
  task :set_default_parties => :environment do |t, args|
    Party.where(:tmp_id.in => [1,2,10]).each{|p| p.update_attributes({ on_default: true })} # ნაციონალური მოძრაობა, პატრიოტთა ალიანსი, ქართული ოცნება
  end

  desc "Remove unused parties"
  task :remove_unused_parties => :environment do |t, args|

    Party.each {|party|
      party_id = party.id

      dataset = Dataset.collection.aggregate([

        { "$match": { 'party_id': party_id } },
        { "$unwind": '$category_datas' },
        { "$group": {
            "_id": nil,
            "sum": { "$sum": "$category_datas.value" },
            "cnt": { "$sum": 1 }
          }
        }
      ]).to_a

      donor = Donor.collection.aggregate([
        { "$unwind": '$donations' },
        { "$match": { 'donations.party_id': party_id } },
        { "$group": {
            "_id": nil,
            "sum": { "$sum": "$donations.amount" },
            "cnt": { "$sum": 1 }
          }
        }
      ]).to_a

      if (!dataset.present? && !donor.present?)
        puts "-------------------#{party.title}----#{dataset.inspect}---#{donor.inspect}"
        party.destroy
      end
      # if (dataset.present? && (dataset[0][:cnt] == 0 || dataset[0][:sum] == 0 ))
      #   puts "------------------#{party.title}----#{dataset.inspect}---#{donor.inspect}"
      # end
      # if (donor.present? && (donor[0][:cnt] == 0 || donor[0][:sum] == 0 ))
      #   puts "------------------#{party.title}----#{dataset.inspect}---#{donor.inspect}"
      # end

      # removed due call
      # სამოქალაქო ალიანსი
      # საზოგადოება "ივერია"
      # ბურჭულაძე - საქართველოს განვითარებისთვის
      # ალექსი შოშიკელაშვილის ამომრჩეველთა საინიციატივო ჯგუფი
      # ვლადიმერ ვახანიას ამომრჩეველთა საინიციატივო ჯგუფი
      # ზვიად ჩიტიშვილის ამომრჩეველთა საინიციატივო ჯგუფი
      # ლევან ჩაჩუას ამომრჩეველთა საინიციატივო ჯგუფი
      # ნუგზარ ავალიანის ამომრჩეველთა საინიციატივო ჯგუფი
      # პარტია საქართველოს გზა
      # საინიციატივო ჯგუფები
    }
  end
end
