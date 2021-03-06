"""
    This python script fills the bandwidth meters in the dashboard. It
    was used during the interop at Excentis.

    Each of the bandwidth meters reprents a single Vendor at the interop.
    In this script you can configure all of the interfaces on all of the
    ByteBlowers used by this vendor. This configuration is done with a
    BPF filter. 

    The results are POST'ed to the dashboard every second. You might need
    to install python-requests extra.
    
    Additionally, all traffic is logged to file. This file
    can be used to for later analysis.

    To get this script working you, you'll need to

    1. Change the IP address of the webserver.
    2. Pick where you want to log the traffic.
    3. Configure the vendor list. 

"""
import argparse
import byteblowerll.byteblower as byteblower
import datetime
import requests
import time
import itertools

WEBSERVER = 'http://127.0.0.1:80/v/' # CHANGE TO YOUR IP

# Set the DEBUG_FILE to None to disable logging.
# DEBUG_FILE = None
DEBUG_FILE = './interop_traffic.log'

class DebugLogger(object):
    """
        Batches several logs

        @detail
        Balancing between keeping things simple and
         1. Logging centralized.
         2. Some performance gains.
    """
    def __init__(self):
        self.logs = []

    def log(self, log_line):
        self.logs.append(log_line)
        if len(self.logs) > 1024 and DEBUG_FILE:
            with open(DEBUG_FILE, 'a') as f:
                for line in self.logs:
                    f.write(line + "\n")
            self.logs = []                    


logger = DebugLogger()
class Updater(object):
    """
        A helper class to performantly retrieve the results from 
        the ByteBlower servers.

        Standard usage is to add all ByteBlower API you want to 
        refresh.
       
        Thereafter call the refresh method regularly to fetch the new snapshots from
        the ByteBlower server and remove old ones.
    """

    def __init__ (self):
        self.update = []

    def add(self, to_refresh):
        """
            Add an item to the list of things
            needing a refresh.
        """
        self.update.append(to_refresh)

    def refresh(self, api):
        """
            Does the actual refresh.
        """
        special_list = byteblower.AbstractRefreshableResultList()
        [b.Clear() for b in self.update]
        [special_list.append(b) for b in self.update]
        api.ResultsRefresh(special_list)
       
port_trigger_count = 0       
class PortTrigger(object): 
    """
        A single, virtual port counter.
        
        @detail
        A thin wrapper around the ByteBlower trigger.
        Mostly useful for creation, cleanup and easy reading out.

        You'll use the abstractions further in the file to
        aggregate multiple PortTriggers.
    """
    def __init__(self, bb_server, bb_interface, bpf=[""]):
        try:
            self.port = bb_server.PortCreate(bb_interface)
        except Exception as e:
            print("Can't create port: %s" % e.getMessage())
            raise e

        self.trigger = self.port.RxTriggerBasicAdd()
        self.trigger.FilterSet(bpf)

        self.server_name = bb_server.ServiceInfoGet().ConnectionHostGet()
        self.bb_interface = bb_interface
        self.detail = ''
        self.bpf = bpf

        global port_trigger_count
        port_trigger_count += 1
    
    def update(self, updater):
        updater.add(self.trigger.ResultHistoryGet())
    
    def result(self):
        """
            Current bandwidth on the interface.
            Returned in bits/s, includes frame overhead.
            Filling the line with 10 Gbit/s will display 10 Gbit/s
        """
        history = self.trigger.ResultHistoryGet()
        if 0 == history.IntervalLengthGet():
            return 0
        
        last_interval  = history.IntervalLatestGet()
        sample_duration = last_interval.IntervalDurationGet() * 1e-9 # seconds
        bytes = last_interval.ByteCountGet()
        packets = last_interval.PacketCountGet()

        min_framesize = 0 
        max_framesize = 0 
    
        if packets > 0:
            min_framesize = last_interval.FramesizeMinimumGet() 
            max_framesize = last_interval.FramesizeMaximumGet() 

        frame_overhead = 24 # bytes
        bytes_to_bits = 8
        physical_count = (bytes + (frame_overhead * packets)) * bytes_to_bits 

        if bytes > 0:
            global logger
            logline = '%d, %s, %s, %s, %s, %d, %d, %d, %d' % (
                    last_interval.TimestampGet(),
                    self.detail,
                    self.server_name,
                    self.bb_interface,
                    self.bpf, 
                    bytes,
                    packets,
                    min_framesize,
                    max_framesize )
            print(logline)
            logger.log(logline)
    
        return physical_count / sample_duration

class TriggerGroup(object): 
    """
        A group of port triggers. Responsible for aggregating several results
        into one.
    """
    def __init__(self, *port_triggers):
        self.triggers = port_triggers
        self._detail = ''

    @property 
    def detail(self):
        return self._detail

    @detail.setter
    def detail(self,value):
        self._detail = value
        for trig in self.triggers:
            trig.detail = value

    @detail.deleter
    def detail(self):
        del self._detail

    @staticmethod
    def combinatorial(bb_servers, interfaces, bpf_filters = ['']):
        """
            A factory method to easily create a group of lots of PortTriggers.

            The group will match all in the filters on all of the interfaces on all
            of the servers.


            @arg bb_server a list of  byteblower servers
            @arg interfaces a list of byteblower interfaces.
            @arg bpf_filters a list of BPF filters. Default everything is matched.
        """
        port_list = []

        # Make a list out of everything.
        interface_list = list(interfaces)
        bpfs = list(bpf_filters)
        servers = list(bb_servers)

        for server in servers:
            for interface in interface_list:
                for bpf in bpfs: 
                    try:
                        port = PortTrigger(server, interface, bpf)
                        port_list.append(port)
                    except:
                        pass
        return TriggerGroup(*port_list)                    

    def update(self, updater):
        [trig.update(updater) for trig in self.triggers]
    
    def result(self):
        return sum([trig.result()  for trig in self.triggers])

    def result_each_trigger(self):
        res = []
        for trig in self.triggers:
            res.append({'name': trig.bb_interface, 'data':[trig.result()]})    
        return res
class Vendor(object):
    """
        Abstracts to a single vendor.

        (Remember this test was written for an interop with many vendors)

        Each vendor has single (aggregated) upstream and downstream.
        You can use the triggergroups to combine multiple interfaces/ports/filters.

    """
    def __init__(self, name, upstream, downstream, debug= False):
        self.name = name
        self.upstream = upstream
        self.downstream = downstream

        upstream.detail = 'up ' + name
        downstream.detail = 'down ' + name

        self.debug_trigger = debug

    def update(self, updater):
        self.upstream.update(updater)
        self.downstream.update(updater)

    def result(self):
        return {'upstream' : self.upstream.result(),
                'downstream' : self.downstream.result() }

    def result_each_trigger(self):
        return {
            'upstream': self.upstream.result_each_trigger(),
            'downstream': self.downstream.result_each_trigger()
        }

    def post_results(self, base_url):
        result = self.result_each_trigger()
        print(result)
        if not self.debug_trigger:
            specific = base_url + self.name
            print(specific)
            r = requests.post(specific, json = result) 
            print(r.status_code)


def single_update(vendors):
    update = Updater()
    for v in vendors:
        v.update(update)
    print('Refreshing')
    update.refresh(byteblower.ByteBlower.InstanceGet())

    for v in vendors:
        # print('Posting results ' + v.name)
        v.post_results(WEBSERVER)


# A DSL to configure the system
API = byteblower.ByteBlower.InstanceGet()
def bb_server(address):
    try:
        return API.ServerAdd(address)
    except:
        print("Can't reach %s" % address)

### Start polling.
###
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-s', '--servers', help="Comma seperated Byteblower Servers", type=str)
    parser.add_argument('-t','--trunks',nargs=2, metavar=('minimum','maximum'),help='Trunk range starting from minimum to maximum', default=['1', '9'])
    parser.add_argument('-nt', '--nontrunks', nargs='*', metavar=('nontrunk-<interface>'), help='non trunking ports', default=['nontrunk-1'])
    args = parser.parse_args()

    print(args.nontrunks)

    servers = [bb_server(server) for server in args.servers.split(',')]
    non_trunks = TriggerGroup.combinatorial(servers, args.nontrunks)
    trunks = TriggerGroup.combinatorial(servers, ['trunk-1-%d' % i for i in range(int(args.trunks[0]), int(args.trunks[1]))])

    print(trunks)

    vendors = [Vendor('byteblower', upstream=non_trunks, downstream=trunks, debug=False)]

    print('Has %d triggers' % port_trigger_count)

    while True:
        print('Update %s' % (str(datetime.datetime.now())))
        single_update(vendors)
        time.sleep(0.9)


