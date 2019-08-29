# This script is used to fill in the ini-file for the interop dashboard.
# The ini-file contains entries for modems which are online on different RPDs.
# The entries are IP addresses, but based on the core to which the RPD is connected,
# the IP address will change. So this TOOP script will make sure these IP
# addresses are kept up to date.
cd /root/ByteBlower_dashboard2/byteblower_poller
source TOOP.tclClass

# this is an ordered list, based on the RPD order in the dashboard ini-file.
set modemMacList {"a86b.adfc.06e5" "f44b.2add.6afe" "a86b.adfc.06bd" "444e.6d2f.2344" "00d0.59e1.7b3b" "0037.b7ff.5188"\
                  "f46b.efcf.e5c8" "a86b.adfc.06e1" "f44b.2add.6b28" "a86b.adfc.06f9" "f44b.2add.6b1c"}
set dashboardIniFile "phy.ini"
set modemObjectList {}

foreach modemMac $modemMacList {
    set modemObject [TOOP New com.Excentis.Euro-DOCSIS.Device.Cm.Cm31]
    $modemObject Initialize -mac $modemMac
    lappend modemObjectList $modemObject
}

set waiter [TOOP New com.Excentis.Util.Wait]
while 1 {
    set ipList {}
    foreach modemObject $modemObjectList {
        lappend ipList [$modemObject Ip.Get]
    }
    set iniFileContent "\[BKtel\]
                        phyname=PHY1
                        ip=[lindex $ipList 0]
                        
                        \[Casa\]
                        phyname=PHY2
                        ip=[lindex $ipList 1]
                        
                        \[Cisco\]
                        phyname=PHY3
                        ip=[lindex $ipList 2]
                        
                        \[Commscope\]
                        phyname=PHY4
                        ip=[lindex $ipList 3]
                        
                        \[Delta\]
                        phyname=PHY5
                        ip=[lindex $ipList 4]
                        
                        \[Systemtechnik\]
                        phyname=PHY6
                        ip=[lindex $ipList 5]
                        
                        \[Huawei\]
                        phyname=PHY7
                        ip=[lindex $ipList 6]
                        
                        \[Nokia\]
                        phyname=PHY8
                        ip=[lindex $ipList 7]
                        
                        \[Teleste\]
                        phyname=PHY9
                        ip=[lindex $ipList 8]
                        
                        \[Vecima\]
                        phyname=PHY10
                        ip=[lindex $ipList 9]
                        
                        \[Vector\]
                        phyname=PHY11
                        ip=[lindex $ipList 10]"
    
    set file [open $dashboardIniFile w]
    foreach line $iniFileContent { 
        puts $file $line
    }
    close $file
    $waiter Wait 3000
}
exit














