#!/bin/sh

scriptdir=$(cd $(dirname $0) && pwd -P)

(
	cd ${scriptdir}/;
	npm start&
)
(
	cd ${scriptdir}/byteblower_poller/;
	python poll.py&
	python3 phy.py&
)


