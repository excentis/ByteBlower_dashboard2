import os
import platform
import requests
import time


# CHANGE WEBSERVER IP

WEBSERVER = 'http://10.1.1.17:8080/rp/'
headers = {
    'content-type': "application/json"
    }

DOMAIN_MAP ={
                '10.240': 'Commscope',
                '10.176': 'Casa',
                '10.242': 'Cisco',
                '10.243': 'Huawei',
                '10.244': 'Systemtechnik',
                '10.245': 'Nokia',
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
            
            response = os.system("ping " + self.ip)
        else:
            response = os.system("ping -c 1 " + self.ip)
        # #and then check the response...
        domain = 'Unknoz'
        for key, value in DOMAIN_MAP.items():
            ip_split = self.ip.split('.')[0:2]
            key_split = key.split('.')[0:2]
            if ip_split == key_split:
                domain = value
        payload = dict(pingResponse=response, ip=domain) 
        r = requests.post(url=WEBSERVER + self.name, json=payload, headers=headers)
        print(r.status_code)
"""
TODO: Change IP addresses to correct ones
"""
rdp_vendors = ['BKtel', 'Casa', 'Cisco', 'Commscope', 'Delta', 'Dev Systemtechnik', 'Huawei', 'Nokia', 'teleste', 'vecima', 'vector', 'harmonic']
INI_PATH = 'C:\\Users\\tijs.f\\Documents\\dashboard\\ByteBlower_dashboard2\\byteblower_poller\\phy.ini'

import configparser
config = configparser.ConfigParser()

def update(ini_path):
    """
    Reads the current .ini file so the configparser is updated to the current configuration
    """
    rpds = []
    try:
        config.read(ini_path)
    # Store configuration file values
        for i, vendor in enumerate(rdp_vendors):
            phyname = config[vendor]['phyname'].lower()
            ip = config[vendor]['ip']

            rpds.append(RemotePhy(vendor, phyname, ip))
    except FileNotFoundError:
    # Keep preset values
        for vendor in rdp_vendors:
            rpds.append(RemotePhy(vendor, f'phy{i+1}', '127.0.0.1'))
    return rpds

def check_vendor(vendor):
    """
        check if the vendor details has been updated
    """
    name = config[vendor]['phyname'].lower()
    ip = config[vendor]['ip']
    return name, ip


while True:
    rpds = update(INI_PATH)
    for rpd in rpds:
        name, ip = check_vendor(rpd.vendor_name)
        rpd.name = name
        rpd.ip = ip
        print(rpd.name, rpd.ip)
        rpd.poll()
        time.sleep(1)