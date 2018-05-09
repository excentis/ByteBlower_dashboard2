import byteblowerll.byteblower as byteblower
import requests
import time

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
            Returned in bytes per second, includes frame overhead.
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
        physical_count = bytes + (frame_overhead * packets)

        return physical_count / sample_duration

class TriggerGroup: 
    """
        A group of port triggers. Responsible for aggregating several results.        
    """
    def __init__(self, *port_triggers):
        self.triggers = port_triggers

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
        v.post_results('http://10.1.1.17')


# A DSL to configure the system
API = byteblower.ByteBlower.InstanceGet()
SERVER = API.ServerAdd("byteblower-dev-1300-2.lab.byteblower.excentis.com")

vendors = [Vendor('intel',
                  upstream = TriggerGroup(
                     PortTrigger(SERVER, 'nontrunk-1', ''), 
                     PortTrigger(SERVER, 'nontrunk-1', '') ), 
                  downstream = TriggerGroup(
                     PortTrigger(SERVER, 'nontrunk-1', '') ),
                  )
            ]                  


for _ in xrange(100):
    single_update(vendors)
    time.sleep(0.9)


