
// Ci dessous un simili CRUD en JS natif sans UPDATE via l'API gratuite jsonplaceholder
// voir  https://jsonplaceholder.typicode.com/guide/
// Lorsqu'on la sollicite, elle renvoie des datas pour un GET et 200/ok pour un POST

// il suffit de rattacher ce fichier à n'importe quel template html vide pour essayer


const body = document.getElementsByTagName('body')[0] //htmlCollection
const titre = document.createElement('H1')
const ancre = document.createElement('ul')
const divSuppression = document.createElement('div')
const titreSuppression = document.createElement('H3')
const ancreSuppression = document.createElement('ul')

titre.textContent = "Test de l'API gratuite user de jsonplaceholder avec Fetch"
titreSuppression.textContent = "User(s) supprimé(s) en retour du fetch de suppression via la notice de l'api"

divSuppression.style = "display:none"

body.appendChild(titre)
body.appendChild(ancre)
divSuppression.appendChild(titreSuppression)
divSuppression.appendChild(ancreSuppression)
body.appendChild(divSuppression)


// fonction créant un mini dom manipulable avec les datas recupérèes
// async permet le chainage avec then lors de l'appel
async function domConstruction(data) {
    for (let i = 0; i < data.length; i++) {
        let li = document.createElement('li')
        li.id = `li-${data[i]["id"]}`
        li.className = "users"
        //innerHTML for tags interpretation
        li.innerHTML = `Nom : ${data[i]["name"]} <br>
        Pseudo : <b>${data[i]["username"]}</b> - <a href="#" id="suppression-${data[i]['id']}" 
        class="suppression">Supprimer cette personne</a><hr>`
        ancre.appendChild(li)
    }
}

// CRUD READ
async function fetchUsers(){
    const response = await fetch("https://jsonplaceholder.typicode.com/users", {
        method : "GET",
        headers : {
            "Accept" : "application/json"
        }
    })
    if (response.ok === true) {
        const data = await response.json()
        return data
    } else {
        throw new Error('Mauvaise récupération des datas sur le serveur dans fetchUsers()')
    }
} 

// Construit le dom et permet de charger
// des scripts quand la réponse initiale est recue
async function domInitialisation(){
    let data = await fetchUsers()
    return new Promise((resolve, reject) => {
        if (data && data != [] ) {
            // !! onContentLoaded charge les scripts de création suppression
            resolve(domConstruction(data).then(onContentLoaded())) 
        } else {
            reject('Pbme de récupération des datas dans domInitialisation()')
        }
    })
}

// recupère le dernier id des users
function getLastDomUsersId(){
    const domUsers = document.getElementsByClassName('users')
    const idTable = []
    let lastId
    for (let user of domUsers) {
        idTable.push(user['id'].slice(3,idTable.length))        
    }
    if (idTable.length > 0) {
        lastId = Number(idTable[idTable.length-1])
    } else {
        lastId = -1
    }
    return lastId
}

// CRUD DELETE
function deleteUser(id){
    // je recois "suppression-4" par ex
    const userId = id.slice(12,id.length)
    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, {
        method: 'DELETE',
    }).then((response) => {
        if (response.ok === true) {
            //je récupère le <li> parent et supprime le lien de suppression
            const userSuppr = document.getElementById(id).parentNode
            const lienSuppr = document.getElementById(id)
            // je supprime class et id de l'element supprimé
            userSuppr.classList.remove("users")
            userSuppr.removeAttribute('id')
            userSuppr.removeChild(lienSuppr)
            // j'append à une div pour la forme au lieu de supprimer
            // vu qu'evidemment je ne peux rien supprimer sur l'api !
            divSuppression.appendChild(userSuppr)
            divSuppression.style = "display:block"
        } else {
            console.log('FAIL suppression user')
        }
    }).catch((error)=> console.log('User non supprimé dans deleteUser():', error))
}

// CRUD CREATE
function addUser(userId, name, username) {
    fetch("https://jsonplaceholder.typicode.com/users", {
        method : "POST",
        headers: {'Content-Type' : "application/json"},
        body: JSON.stringify({
            "name" : name,
            "username": username,
            "id": userId
        })
    }).then((response) => {
        if (response.ok === true){
            let li = document.createElement('li')
            li.id = `li-${userId}`
            li.className = "users"
            li.innerHTML = `Nom : ${name} <br>
            Pseudo : <b>${username}</b> - <a href="#" id="suppression-${userId}" 
            class="suppression">Supprimer cette personne</a><hr>`
            ancre.appendChild(li)
            // j'applique donc le comportement de suppression sur le click du lien ici 
            document.getElementById(`suppression-${userId}`).addEventListener('click', function(e){
                e.preventDefault()
                deleteUser(this.id)
            })
            //je vide le form
            const name2 = document.getElementById('nomUser')
            const username2 = document.getElementById('usernameUser')
            name2.value=""
            username2.value=""
        } else {
            throw new Error('Problème avec la réponse de la création du user, !ok')
        }
    }).catch((err)=> console.log('User non créé dans addUser() :', err))
}

// Valide le formulaire de création généré dans onContentLoaded()
function userFormSubmit(){
    const name = document.getElementById('nomUser').value
    const username = document.getElementById('usernameUser').value
    const userId = getLastDomUsersId()+1
    if (name != "" && username != "" && userId != null ){
        addUser(userId, name, username)
    }
}



// lorsque le 1er fetch de récupération des users de l'api est revenu
function onContentLoaded() {

    // suppression d'un user
    const suppression = document.querySelectorAll(".suppression")
    suppression.forEach( function(element){
        element.addEventListener('click', function(e){
            e.preventDefault()
            deleteUser(this.id)
        })
    })

    // création d'un user
    // d'abord creation du form
    const titreCreation = document.createElement('h2')
    const userForm = document.createElement('form')
    const name = document.createElement('input')
    const username = document.createElement('input')
    const nameLabel = document.createElement('label')
    const usernameLabel = document.createElement('label')
    const btnSubmit = document.createElement('button')
    
    userForm.action = ""
    titreCreation.textContent = "création d'un utilisateur"
    name.id = "nomUser"
    name.name = "nomUser"
    name.style = "display:block;margin:o.45em" 
    username.id = "usernameUser"
    username.name = "usernameUser"  
    username.style = "display:block;margin:o.45em"    
    nameLabel.textContent = "Prénom Nom :"
    usernameLabel.textContent = "Pseudo :"
    btnSubmit.textContent = "Créer"
    userForm.onsubmit = userFormSubmit

    userForm.appendChild(nameLabel)
    userForm.appendChild(name)
    userForm.appendChild(usernameLabel)
    userForm.appendChild(username)
    userForm.appendChild(btnSubmit)

    body.appendChild(titreCreation)
    body.appendChild(userForm)

    // et validation du form
    btnSubmit.addEventListener('click', (e)=>{
        e.preventDefault()
        userFormSubmit()
    })
}

domInitialisation()


