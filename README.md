# File-Fixity
<h1>Sistem koji vrsi bekap fajlova na klijentskim masinama</h1>

<h3>Local_node.js</h3> 
				 - lokalna aplikacija koja prati stanje u zadatom folderu i salje nove ili izmenjene fajlove na skladistenje centralnom serveru
			     - Provera stanja fajla vrsi se preko njegove hash vrednosti, da li je fajl promenjen i potrebno ga je obnoviti ili je ostao isi kao u prethodnoj proveri
<h3>Central_node.js</h3>
				 - Serverska aplikacija sa API servisima, prikuplja fajlove klijenata. KOrisnici koji su potvrdili medjusobno deljenje fajlova dobijaju nove fajlove drugih korisnika na cuvanje kod sebe
				 - Nakon sto svi klijenti koji su potvrdili deljenje preuzmu fajlove koje treba da skladiste, fajlovi se brisu sa centralnog servera
				 
<h3>File-fixity-fornt-end</h3> 
				 - Angular aplikacija preko koje je moguce uputiti zahtev drugim korisnicima za skladistenje fajlova na njihovim masinama