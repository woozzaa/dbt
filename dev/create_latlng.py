#!/usr/bin/python
# -*- coding: utf-8 -*- 

from apiclient.discovery import build
from googlemaps import GoogleMaps

apiKey = 'AIzaSyAaXbH4R1IS9ij8odac_2gSZo-7hJa4MFw'

gmaps = GoogleMaps()

address = 'Bryggaregatan 2 Lycksele, Sweden'

# lat, lng = gmaps.address_to_latlng(address)
res = gmaps.geocode(address)

print res

