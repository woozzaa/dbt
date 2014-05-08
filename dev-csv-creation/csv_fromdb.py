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

		#Corresponding array with location for each school
		locationarray = [u"Glastjärnsvägen 2 A Lycksele",
		u"Helena Öhmans Väg 3 Lycksele",
		u"Skolvägen 7 Lycksele",
		u"Skolvägen 7 Lycksele",
		u"Grundtjärnsvägen 67 Lycksele",
		u"Hedlunda 62 Lycksele",
		u"Kornvägen 6 Lycksele",
		u"Storgatan 58 Lycksele",
		u"Storgatan 58 Lycksele",
		u"Bryggaregatan 2 Lycksele",
		u"Knaften Lycksele",
		u"Knaften 209 Lycksele",
		u"Skolvägen 10 Kristineberg",
		u"Lövstigen 6 Lycksele",
		u"Glastjärnsvägen 2 A Lycksele",
		u"Grönsaksstigen 14 Lycksele",
		u"Länsmansvägen 2 Lycksele",
		u"Vindelälvsvägen 39 Lycksele",
		u"Vindelälvsvägen 34 Lycksele",
		u"Grundtjärnsvägen 67 Lycksele",
		u"Umgransele 96 Lycksele",
		u"Umgransele 96 Lycksele",
		u"Glasbegrgsvägen 18 Lycksele",
		u"Granitvägen 6 Lycksele",
		u"Storgatan 75 Örträsk",
		u"Storgatan 75 Örträsk",
		u"Domarvägen 11 Lycksele",
		u"Okänd",
		u"Skolvägen 10 Kristineberg",
		u"Okänd",
		u"Okänd"]

		text_file = open('finaldb.txt', 'w')
		top = 'DATE, SCHOOL, LOCATION, NUMBER \n'
		text_file.write(top)

		datedict = {}
		famdag = 0

		# Gets schools
		for school in Model.School().select():
			
			#Skipping all the Familjedaghem
			if (unicode(school.name) == "Familjedaghem Centrum") or (unicode(school.name) == u"Familjedaghem Norräng") or (unicode(school.name) == "Familjedaghem Forsdala"):
				famdag += 1
			
			#for the the rest of the schools
			else:

				try:
					#locate index for school
					index = schoolarray.index(school.name)
				except ValueError:
					print index
					print school.name, ' <-- ERROR'
					break

				# get location
				location = locationarray[index]
				
				school.name = school.name.replace(',', '')
				
				print '------------------------------------'
				print school.name
				print '------------------------------------'

				# for each school, get departments
				for dep in school.departments:

					# for each department, get childdeparments
					for childdep in dep.children:
						
						#gets abscenses for each children in each department
						for childabs in childdep.child.absences:
							
							# if date doesnt exist in datedict, adds it to dict
							if datedict.get(childabs.date) == None:
								
								datedict.setdefault(childabs.date, []) #(key, array)
								
								nr       = 1
								tempdict = {'location': location, 'school': school.name, 'nr': nr}
								datedict[childabs.date].append(tempdict)

							# else, if date already exists
							else:

								if datedict.get(childabs.date, None) is None:
									print 'error stuff in temp'
									return 0
								
								# index and boolena variables
								index_temp = 0;
								school_found = False
								
								# looks for school in all dictionarys in array for specific date
								for value in datedict.get(childabs.date, None):
									
									# compares schoolname in dictionaries with active school
									if value['school'].encode('utf-8') == school.name.encode('utf-8'):
										school_found = True
										break

									else:
										index_temp += 1

								# updates nr of sick children that day for specific school, if found
								if school_found is True:
									datedict[childabs.date][index_temp]['nr'] += 1 
								# if school not found, adds to array 
								else:
									nr = 1									
									tempdict = {'location': location, 'school': school.name, 'nr': nr}
									datedict[childabs.date].append(tempdict)

		print famdag
		print 'datedict done, creating file'
		time.sleep(1)
		
		# CREATES CSV FILE
		for keys in datedict.keys():
			#print "k: " + keys #keys = datum
			tempdict = datedict[keys]
			# print keys
			for val in tempdict:
				# print 'val'
				# print val
				strang = str(keys) + ", " + val['school'].encode('utf-8') + ", " + val['location'].encode('utf-8') + ", " + str(val['nr']) + "\n"
				text_file.write(strang)

		print 'File done'


if __name__ == "__main__":
	p = Program()
	p.run()

"""

school -> department -> child (kolla om toDate passerat) -> abscences

"""