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

    def __init__(self, name, ip):
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
        payload = dict(pingResponse=response) 
        r = requests.post(url=WEBSERVER + self.name, json=payload, headers=headers)
    
"""
TODO: Change IP addresses to correct ones
"""

    
phy1 = RemotePhy('BKtel', '10.3.3.243')
phy2 = RemotePhy('Casa', '10.3.3.243')
phy3 = RemotePhy('Cisco', '10.3.3.243')
phy4 = RemotePhy('Commscope', '10.3.3.243')
phy5 = RemotePhy('DCT DELTA', '10.3.3.243')
phy6 = RemotePhy('DEV Systemtechnik', '10.3.3.243')
phy7 = RemotePhy('Huawei', '10.3.3.243')
phy8 = RemotePhy('Nokia', '10.3.3.243')
phy9 = RemotePhy('Teleste', '10.3.3.243')
phy10 = RemotePhy('Vecima Networks', '10.3.3.243')
phy11 = RemotePhy('Vector Technologies', '10.3.3.243')

phys = [phy1, phy2, phy3, phy4, phy5, phy6, phy7, phy8, phy9, phy10, phy11]
while True:
    for phy in phys:
        phy.poll()
        time.sleep(1)