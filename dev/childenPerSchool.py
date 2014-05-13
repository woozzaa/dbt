#!/usr/bin/python
# -*- coding: utf-8 -*- 

# Python imports
import sys
import os
import time

from peewee import *

import Models as Model

class Program(object):

	database = SqliteDatabase('database.db')

	def __init__(self):
		self.database.connect()

	def run(self):
		#Array with schools
		schoolarray = [u"Filurens förskola", 
		u"Forsdala Fritidshem",
		u"Furuvik förskola",
		u"Furuvik, fritidshem",
		u"Södermalm förskola, Daggkåpan",
		u"Hedlunda fritidshem",
		u"Hedlunda förskola",
		u"Johan Skyttes fritidshem",
		u"Johan Skyttes förskola",
		u"Jonsta förskola",
		u"Knaften fritidshem",
		u"Knaften förskola", 
		u"Kristineberg förskola",
		u"Lövstugan förskola",
		u"Mojängens Förskola",
		u"Morotens förskola",
		u"Norrskenet förskola",
		u"Rusksele fritidshem",
		u"Rusksele förskola",
		u"Södermalm fritidshem",
		u"Umgransele fritidshem",
		u"Umgransele förskola",
		u"Villaryd förskola",
		u"Villa Wallleboa",
		u"Örträsk fritidshem",
		u"Örträsk förskola",
		u"Norräng fritidshem",
		u"Familjedaghem Centrum",
		u"Kristineberg fritidshem",
		u"Familjedaghem Norräng",
		u"Familjedaghem Forsdala"]

	for school in Model.School().select():
		
		#Skipping all the Familjedaghem
		if (unicode(school.name) == "Familjedaghem Centrum") or (unicode(school.name) == u"Familjedaghem Norräng") or (unicode(school.name) == "Familjedaghem Forsdala"):
			famdag += 1
		
		#for the the rest of the schools
		else:
			# for each school, get departments
			for dep in school.departments:

				# for each department, get childdeparments
				for childdep in dep.children:
					
					#gets abscenses for each children in each department
					for child in childdep.child:
						print 'child = ' child.name;
