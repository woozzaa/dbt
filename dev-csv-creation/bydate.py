#!/usr/bin/python
# -*- coding: utf-8 -*-
import json
import datetime
from collections import defaultdict

def main():

	# f = open("../json/dbt-fulllist.json")
	f = open("../json/dbt-fulllist.json")
	jdata = json.load(f)
	#jdata.encode('utf-8')
	f.close()

	text_file = open("final.txt", "w")
	top = "DATE, SCHOOL, LOCATION, NUMBER \n" # HEADER
	text_file.write(top)

	#Array with schools
	schoolarray = [u"Filurens förskola", 
	u"Forsdala Fritidshem",
	u"Furuvik förskola",
	u"Furuvik fritidshem",
	u"Förskolan Daggkåpan",
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
	u"Norräng fritidshem"]

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
	u"Glasbergsvägen 18 Lycksele",
	u"Granitvägen 6 Lycksele",
	u"Storgatan 75 Örträsk",
	u"Storgatan 75 Örträsk",
	u"Domarvägen 11 Lycksele"]

	# print len(locationarray)
	# print len(schoolarray)

	datedict = {} #dict for sick childen per date and school
	famdag = 0 #Counts nr of familjedaghem


	for child in jdata:

		# GETS SCHOOL NAME. 
		try:
			school = child['enrollments'][0]['schoolName'] #Gets school 
		except IndexError:
			print "out of children"

		#Skipping all the Familjedaghem
		if (school == "Familjedaghem Centrum") or (school == u"Familjedaghem Norräng") or (school == "Familjedaghem Forsdala"):
			famdag += 1

		else:
			#CORRECTS INCORRECT SCHOOL NAMES
			if school == "Furuvik, fritidshem":
				school = "Furuvik fritidshem"

			elif school == u'Södermalm förskola, Daggkåpan':
				school = u"Förskolan Daggkåpan"

			elif school == u"Kristineberg fritidshem":
				school = u"Kristineberg förskola"

			else:
				pass

			#Gets index in schoolarray => gets address
			try: 
				#Gets index in schoolarray
				index = schoolarray.index(school)
			except ValueError:
				print index
				print school.encode('utf-8')
				break

			#Gets index in locationarray
			location = locationarray[index]

			# ITERATES THROUGH DATES
			for dates in child['absences']:
				
				date = dates['date']
				# print "date = " + date

				# ADDS DATE TO DICT            
				if datedict.get(date) == None:

					datedict.setdefault(date, [])
					nr = 1
					loc = location
					tempdict = {'location': loc, 'school': school, 'nr': nr}
					datedict[date].append(tempdict)
					#print "No date in array"
					
				else:
					
					temp = datedict.get(date, None) # GETS VALUE FROM DICT
					# print school
					
					if temp is None:
						print 'error stuff in temp'
						break
					
					elif temp[0]['school'].encode('utf-8') != school.encode('utf-8'):
						nr = 1
						loc = location
						tempdict = {'location': loc, 'school': school, 'nr': nr}
						print 'school' + school.encode('utf-8')
						print 'school in temp' + temp[0]['school']
						datedict[date].append(tempdict)
						# print datedict
						# print 'temp' +   str(temp)

					# elif temp[0]['school'] == str(school):
					else:
						nr = temp[0].values()[-1] + 1
						datedict[date][0]['nr'] = nr
						print 'already there, adding'



					# # nr = temp[0].values()[1]
					# nr = temp[0].values()[-1] + 1
					# # print nr
					# #tempdict = {'nr': nr}
					# #datedict[date].append(tempdict)     # ADDS TO DICT
					# #datedict[date]['nr'] = nr
					# datedict[date][0]['nr'] = nr
					

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

		#print str(tempdict) + " " + str(keys)
		
		#print strang
		
		#print strang
		


	# print famdag            
	# print datedict
	


		
		
	#print datedict
	

if __name__ == "__main__":
	main()