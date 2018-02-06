namespace :phantomjs_highcharts do
  desc 'Starts the Phantomjs Highcharts server.'
  task :start do |task|
    system %(echo "")
    system %(echo "Starting Phantomjs Highcharts.")
    system %(#{sudo_ssh_cmd(task)} 'sudo systemctl start phantomjs-highchart-pin')
    system %(echo "")
  end

  desc 'Stops the Phantomjs Highcharts server.'
  task :stop do |task|
    system %(echo "")
    system %(echo "Stopping Phantomjs Highcharts.")
    system %(#{sudo_ssh_cmd(task)} 'sudo systemctl stop phantomjs-highchart-pin')
    system %(echo "")
  end

  desc 'Restarts the Phantomjs Highcharts server.'
  task :restart do |task|
    system %(echo "")
    system %(echo "Restarts Phantomjs Highcharts.")
    system %(#{sudo_ssh_cmd(task)} 'sudo systemctl restart phantomjs-highchart-pin')
    system %(echo "")
  end

  # desc 'Reload the Phantomjs Highcharts server.'
  # task :reload do |task|
  #   system %(echo "")
  #   system %(echo "Reload Phantomjs Highcharts.")
  #   system %(#{sudo_ssh_cmd(task)} 'sudo systemctl reload phantomjs-highchart-pin')
  #   system %(echo "")
  # end

  desc 'Checks the status of the Phantomjs Highcharts server.'
  task :status do |task|
    system %(echo "")
    system %(echo "Checking Phantomjs Highcharts status.")
    system %(#{sudo_ssh_cmd(task)} 'systemctl status phantomjs-highchart-pin')
    system %(echo "")
  end
end
