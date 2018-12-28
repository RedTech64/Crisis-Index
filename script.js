google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

var db = firebase.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings);
var docRef = db.collection("settings").doc("breakdown");
var data = [];
var init = false;
var chartData = [['Day', 'Price']];
docRef.get().then(function(doc) {
        console.log("Document data:", doc.data());
        data = doc.data().data;
        subscribeAll();
}).catch(function(error) {
    console.log("Error getting document:", error);
});

function subscribeAll() {
    for(var k = 0; k < data.length; k++) {
        subscribe(k);
    }
}

function subscribe(index) {
    db.collection("components").doc(data[index].symbol)
        .onSnapshot(function(doc) {
            data[index].data = doc.data().data;
            if(init) {
                calculate();
            } else {
                calculateAll();
                init = true;
            }
        });
}

function calculateAll() {
    for(var i = 0; i < data[0].data.length; i++) {
        var sum = 0;
        for (var j = 0; j < data.length; j++) {
            sum += (data[j].data[i].price * data[j].mult);
        }
        chartData.push([data[0].data[i].date, sum]);
        console.log(data[0].data[j].date);
    }
    drawChart()
    document.getElementById('text').innerText = chartData[chartData.length-1][1];
}
function calculate() {
    var sum = 0;
    for (var j = 0; j < data.length; j++) {
        sum += (data[j].data[data[j].data.length-1].price * data[j].mult);
        chartData[chartData.length-1] = [data[0].data[j].date, sum];
    }
    drawChart()
}

function drawChart() {
    var data = google.visualization.arrayToDataTable(chartData);

    var options = {
        title: 'Crisis Index',
        hAxis: {title: 'Year',  titleTextStyle: {color: '#333'}},
        vAxis: {minValue: 100}
    };

    var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}