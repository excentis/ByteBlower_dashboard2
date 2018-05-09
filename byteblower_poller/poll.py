import byteblowerll.byteblower as byteblower
import requests
import time

WEBSERVER = 'http://10.1.1.17'
class Updater:
    """
        A helper class to fetch the results from the ByteBlower servers

        Standard usage is to offer this class to every other that has API 
        objects needing to be managed. 
        
        Call the refresh method regularly will fetch the new snapshots from
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
            Does the refresh.
        """
        special_list = byteblower.AbstractRefreshableResultList()
        [b.Clear() for b in self.update]
        [special_list.append(b) for b in self.update]
        api.ResultsRefresh(special_list)
            
class PortTrigger: 
    """
        A single, virtual port counter.
        
        @detail
        A thin wrapper around the ByteBlower trigger.
        Mostly useful for creation, cleanup and easy reading out.
    """
    def __init__(self, bb_server, bb_interface, bpf):
        self.port = bb_server.PortCreate(bb_interface)
        self.trigger = self.port.RxTriggerBasicAdd()
        self.trigger.FilterSet(bpf)

    def update(self, updater):
        updater.add(self.trigger.ResultHistoryGet())
    
    def result(self):
        """
            Current bandwidht on the interface.
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
        frame_overhead = 24 # bytes
        bytes_to_bits = 8
        physical_count = (bytes + (frame_overhead * packets)) * bytes_to_bits 

        return physical_count / sample_duration

class TriggerGroup: 
    """
        A group of port triggers. Responsible for aggregating several results.        
    """
    def __init__(self, *port_triggers):
        self.triggers = port_triggers

    @staticmethod
    def combinatorial(bb_servers, interfaces, bpf_filters = ['']):
        """
            A factory method to easily create a Group of lots of PortTriggers.

            The group will match all in the filters on all of the interfaces on all
            of the servers.

            @arg bb_server a list of  byteblower servers
            @arg interfaces a list of byteblower interfaces.
            @arg bpf_filters a list of BPF filters. Default everything is matched.
        """
        port_list = []
        for server in bb_servers:
            for interface in interfaces:
                for bpf in bpf_filters: 
                    port = PortTrigger(server, interface, bpf)
                    port_list.append(port)
        print(port_list)                    
        return TriggerGroup(*port_list)                    

    def update(self, updater):
        [trig.update(updater) for trig in self.triggers]
    
    def result(self):
        return sum([trig.result()  for trig in self.triggers])


class Vendor:
    """
        Abstracts a single vendor.

        Each vendor has single (aggregated) upstream and downstream.
    """
    def __init__(self, name, upstream, downstream):
        self.name = name
        self.upstream = upstream
        self.downstream = downstream

    def update(self, updater):
        self.upstream.update(updater)
        self.downstream.update(updater)

    def result(self):
        return {"upstream" : self.upstream.result(),
                "downstream" : self.downstream.result() }

    def post_results(self, base_url):
        specific = base_url + "/" + self.name
        r = requests.post(specific, data = self.result())



def single_update(vendors):
    update = Updater()
    for v in vendors:
        v.update(update)

    update.refresh(byteblower.ByteBlower.InstanceGet())

    for v in vendors:
        print("%s, %s" % (v.name, str(v.result())))
        v.post_results(WEBSERVER)


# A DSL to configure the system
API = byteblower.ByteBlower.InstanceGet()
def bb_server(address):
    try:
        return API.ServerAdd(address)
    except:
        print("Can't reach %s" % address)

# The actual config
SERVER = bb_server("byteblower-dev-1300-2.lab.byteblower.excentis.com")
#SERVER = bb_server("byteblower-tutorial-1300.lab.byteblower.excentis.com")

bb_cpe1 = bb_server("byteblower-iop-CPE-1.interop.excentis.com")
bb_cpe2 = bb_server("byteblower-iop-CPE-2.interop.excentis.com")
bb_nsi1 = bb_server("byteblower-iop-NSI-1.interop.excentis.com")
#bb_nsi2 = bb_server("byteblower-iop-NSI-2.interop.excentis.com")
bb_nsi2 = bb_server("10.7.0.22")


all_nontrunks = ['nontrunk-1', 'nontrunk-2', 'nontrunk-3', 'nontrunk-4']
all_nsi_byteblowers = [bb_nsi1, bb_nsi2]
vendors = [Vendor('intel',
                  upstream = TriggerGroup.combinatorial(
                     all_nsi_byteblowers,
                     all_nontrunks,
                     ['ip dst 10.%d.254.11' % d for d in range(240,250)]),
                  downstream = TriggerGroup.combinatorial( 
                      [bb_cpe1],
                      ['trunk-2-%d' % d for d in range(1,5)])),
            Vendor('broadcom',
                upstream = TriggerGroup.combinatorial(
                     all_nsi_byteblowers,
                     all_nontrunks,
                     ['ip dst 10.%d.254.12' % d for d in range(240,250)]),
                  downstream = TriggerGroup.combinatorial( 
                      [bb_cpe1],
                      ['trunk-2-%d' % d for d in range(5,9)])),
            Vendor('sagemcom',
                upstream = TriggerGroup.combinatorial(
                     all_nsi_byteblowers,
                     all_nontrunks,
                     ['ip dst 10.%d.254.13' % d for d in range(240,250)]),
                  downstream = TriggerGroup.combinatorial( 
                      [bb_cpe2],
                      ['trunk-3-%d' % d for d in range(1,13)])),
            Vendor('hitron',
                upstream = TriggerGroup.combinatorial(
                     all_nsi_byteblowers,
                     all_nontrunks,
                     ['ip dst 10.%d.254.14' % d for d in range(240,250)]),
                  downstream = TriggerGroup.combinatorial( 
                      [bb_cpe2],
                      ['trunk-1-%d' % d for d in range(1,13)])),
            Vendor('technicolor',
                upstream = TriggerGroup.combinatorial(
                     all_nsi_byteblowers,
                     all_nontrunks,
                     ['ip dst 10.%d.254.15' % d for d in range(240,250)]),
                  downstream = TriggerGroup.combinatorial( 
                      [bb_cpe2],
                      ['trunk-4-%d' % d for d in range(1,13)])),
            Vendor('cbn',
                upstream = TriggerGroup.combinatorial(
                     all_nsi_byteblowers,
                     all_nontrunks,
                     ['ip dst 10.%d.254.16' % d for d in range(240,250)]),
                  downstream = TriggerGroup.combinatorial( 
                      [bb_cpe2],
                      ['trunk-2-%d' % d for d in range(1,13)])),
            Vendor('avm',
                upstream = TriggerGroup.combinatorial(
                     all_nsi_byteblowers,
                     all_nontrunks,
                     ['ip dst 10.%d.254.17' % d for d in range(240,250)]),
                  downstream = TriggerGroup.combinatorial( 
                      [bb_cpe1],
                      ['trunk-1-%d' % d for d in range(1,13)])),
            Vendor('askey',
                upstream = TriggerGroup.combinatorial(
                     all_nsi_byteblowers,
                     all_nontrunks,
                     ['ip dst 10.%d.254.18' % d for d in range(240,250)]),
                  downstream = TriggerGroup.combinatorial( 
                      [bb_cpe1],
                      ['trunk-3-%d' % d for d in range(1,13)])),
            Vendor('ubee',
                upstream = TriggerGroup.combinatorial(
                     all_nsi_byteblowers,
                     all_nontrunks,
                     ['ip dst 10.%d.254.19' % d for d in range(240,250)]),
                  downstream = TriggerGroup.combinatorial( 
                      [bb_cpe1],
                      ['trunk-4-%d' % d for d in range(1,13)]))
            ]
#vendors = [Vendor('intel',
#                  upstream = TriggerGroup(
#                     PortTrigger(SERVER, 'nontrunk-1', 'ip dst net 10.241.0.0 mask'), 
#                     PortTrigger(SERVER, 'nontrunk-1', '') ), 
#                  downstream = TriggerGroup(
#                     PortTrigger(SERVER, 'nontrunk-1', '') ),
#                  )
#            ]                  
#
while True:
    single_update(vendors)
    time.sleep(0.9)


