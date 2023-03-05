//App
const db = new Dexie('App');
db.version(1).stores({
    items: '++id,description,image,isDone'
});
db.open().catch (function (err) {
    // Error occurred
    alert("Database ERROR");
});



/* ---------------------- */
/* ------- Setup -------- */
/* ---------------------- */

//Déclaration des éléments de la page
const itemId = document.getElementById('itemId');
const itemDescription = document.getElementById('description');
const itemImage = document.getElementById('image');



//Déclaration des variables de transition
var searchResultId;
var searchResultDescription;
var searchResultImage;



//Fonction lancée si c'est le premier démarage de l'application
async function firstlaunch() {
    await db.items.bulkAdd([
        { id: 1, description: "item n°1", image: "image", isDone: "N" },
        { id: 2, description: "item n°2", image: "image2", isDone: "N" },
        { id: 3, description: "item n°3", image: "image3", isDone: "N" }
    ]);
};



/* ---------------------- */
/* ----- Animations ----- */
/* ---------------------- */

//Fade out
function fadeOut(element, callback) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            op = 0.1;
            callback();
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 10);
};

//Fade in
function fadeIn(element) {
    var op = 0.1;  // initial opacity
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
            op = 1;
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 10);
};



/* ---------------------- */
/* ----- Principal ------ */
/* ---------------------- */

//Afficher qu'il ne reste plus rien de marqué comme non terminé dans la BDD
function noMoreItems() {
    //Changer ID
    itemId.innerHTML = "0";
    //Changer Description
    itemDescription.innerHTML = "No more items";
    //Animation Fade In puis Out
    fadeOut(itemImage, function() {
        //Changer image src
        itemImage.src="./assets/placeholderNoMore.jpg";
        fadeIn(itemImage);
    });
    return;
};



//Changer les données affichées dans la page
function change() {
    //Delay le résultat pour que la requète ait le temps d'aboutir
    setTimeout(() => {
        //Change ID
        itemId.innerHTML = searchResultId;
        //Change Description
        itemDescription.innerHTML = searchResultDescription;
        //Animation Fade In then Out
        fadeOut(itemImage, function() {
            //Change image src
            itemImage.src="./assets/"+searchResultImage+".jpg";
            fadeIn(itemImage);
        });
    }, 200);
};



//Chercher des items non marqués comme terminés
async function search() {
    //Compter le nombre d'items à faire
    var count = await db.items.where("isDone").equals("N").count();

    //Si il n'y a plus rien
    if(count == 0) {
        noMoreItems(); return;
    };

    //Générer un nombre aléatoire
    var rand = parseInt(Math.floor(Math.random() * count + 1)-1);

    //Lister dans un tableu les ID des éléments qui ne sont pas terminés
    var notDoneIdList = [];
    await db.items
      .where("isDone")
      .equals("N")
      .each(item => notDoneIdList.push(item.id));

    //Sélectionner un élément marqué comme non terminé au hasard
    var result = await db.items
        .where("isDone").equals("N")
        .and(item => item.id === notDoneIdList[rand])
        .toArray();

    //Récupérer le contenu de l'item sélectionné
    searchResultId = result[0].id;
    searchResultDescription = result[0].description;
    searchResultImage = result[0].image;
    
    //Changer les données affichées dans la page
    change();
};



//Marquer un item comme terminé
async function markAsDone(id) {
    await db.items.update(id, {isDone: "Y"}).then(
        function (updated) {
            if (updated) {} else {
                console.log ("ERROR with item number "+id+" !");
            }
        }
    );
};



//Marquer un item comme NON terminé
async function markAsNotDone(id) {
    await db.items.update(id, {isDone: "N"}).then(
        function (updated) {
            if (updated) {} else {
                console.log ("ERROR with item number "+id+" !");
            }
        }
    );
};



//Fonction lancée lors de l'appui sur le bouton
async function generate() {
    //Check si c'est le premier lancement de l'application (si il y a quelque chose dans la BDD)
    var count = await db.items.count();
    if (count == 0) {
        firstlaunch();
    }

    //Vérifier si un item est affiché dans la page.
    if(itemId.textContent.length > 0){
        //Récupérer l'élément affiché
        var id = parseInt(itemId.textContent);
        
        //Marquer l'élément affiché comme terminé
        markAsDone(id);

        //Chercher des items non marqués comme non terminés
        search();
    } else {
        //Chercher des items non marqués comme non terminés
        search();
    };
};



//Reset
async function reset(db) {
    //Recréer la BDD
    return db.delete().then(()=>db.open());
}