import os
import platform
import requests
import time


# CHANGE WEBSERVER IP

WEBSERVER = 'http://127.0.0.1:8080/rp/'
headers = {
    'content-type': "application/json"
    }
class RemotePhy(object):
    """
        This class represents a remote phy and consists of it's name and ip address
    """

    def __init__(self, vendor_name, name, ip):
        self.vendor_name = vendor_name
        self.name = name
        self.ip = ip
        self.s = requests.Session()

    def poll(self):
        """
            Sends a ping request to the Remote Phy IP address

            returns: 0 of there was no connection/ 1 if there was
        """
        if platform.system() == "Windows":
            
            response = os.system("ping " + self.ip + ' -n 1')
        else:
            response = os.system("ping -c 1 " + self.ip)
        # #and then check the response...
        payload = dict(pingResponse=response, ip=self.ip) 
        r = requests.post(url=WEBSERVER + self.name, json=payload, headers=headers)
    
"""
TODO: Change IP addresses to correct ones
"""
rdp_vendors = ['BKtel', 'Casa', 'Cisco', 'Commscope', 'Delta', 'Dev Systemtechnik', 'Huawei', 'Nokia', 'teleste', 'vecima', 'vector']
INI_PATH = 'C:\\Users\\tijs.f\\Documents\\dashboard\\ByteBlower_dashboard2\\byteblower_poller\\phy.ini'

import configparser
config = configparser.ConfigParser()

def update(ini_path):
    rpds = []
    config.read(ini_path)
    for vendor in rdp_vendors:
        phyname = config[vendor]['phyname'].lower()
        ip = config[vendor]['ip']

        rpds.append(RemotePhy(vendor, phyname, ip))
    return rpds

def check_vendor(vendor):
    name = config[vendor]['phyname'].lower()
    ip = config[vendor]['ip']
    return name, ip
    
# phy1 = RemotePhy('phy1', '10.3.3.243') # BKtel
# phy2 = RemotePhy('phy2', '10.3.3.243') # Casa
# phy3 = RemotePhy('phy3', '10.3.3.243') # Cisco
# phy4 = RemotePhy('phy4', '10.3.3.243') # Commscope
# phy5 = RemotePhy('phy5', '10.3.3.243') # Delta
# phy6 = RemotePhy('phy6', '10.3.3.243') # Dev Systemtechnik
# phy7 = RemotePhy('phy7', '10.3.3.243') # Huawei
# phy8 = RemotePhy('phy8', '10.3.3.243') # Nokia
# phy9 = RemotePhy('phy9', '10.3.3.243') # teleste
# phy10 = RemotePhy('phy', '10.3.3.243') # vecima
# phy11 = RemotePhy('phy', '10.3.3.243') # vector

# phys = [phy1, phy2, phy3, phy4, phy5, phy6, phy7, phy8, phy9, phy10, phy11]
# while True:
#     for phy in phys:
#         phy.poll()
#         time.sleep(1)

while True:
    rpds = update(INI_PATH)
    for rpd in rpds:
        name, ip = check_vendor(rpd.vendor_name)
        rpd.name = name
        rpd.ip = ip
        rpd.poll()
        time.sleep(1)