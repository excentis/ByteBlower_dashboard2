import byteblowerll.byteblower as byteblower
import requests
import time

class Updater:
    """
        A helper class to refresh snapshot histories.

        Uses a visitor pattern to collect all Refreshable results.
    """
    def __init__ (self):
        self.update = []

    def add(self, to_refresh):
        """
            Add an item to the list of things
            needing  a refresh.
        """
        self.update.append(to_refresh)

    def refresh(self, api):
        """
            Does the refresh.
        """
        a = byteblower.AbstractRefreshableResultList()
        [a.append(b) for b in self.update]
        api.ResultsRefresh(a)
            
class PortTrigger: 
    """
        A single, virtual vendor counter.
        
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

API = byteblower.ByteBlower.InstanceGet()
SERVER = API.ServerAdd("byteblower-dev-1300-2.lab.byteblower.excentis.com")
interfaces= {'Intel' : PortTrigger(SERVER, 'nontrunk-1', ''), 'Huaway' : PortTrigger(SERVER, 'nontrunk-2', '')}


vendors = interfaces.values()

def single_update(vendors):
    update = Updater()
    for v in vendors:
        v.update(update)

    update.refresh(byteblower.ByteBlower.InstanceGet())

    for v in vendors:
        print(v.result())

for _ in xrange(100):
    single_update(vendors)
    time.sleep(0.9)


