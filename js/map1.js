"use strict";

(function () {

    window.addEventListener("load", init);

    function init() {
        mapboxgl.accessToken =
            'pk.eyJ1IjoiamFrb2J6aGFvIiwiYSI6ImNpcms2YWsyMzAwMmtmbG5icTFxZ3ZkdncifQ.P9MBej1xacybKcDN_jehvw';
        let map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/dark-v10',
            zoom: 4.3,
            center: [-91, 39.5],
            projection: 'albers'
        });

        const years = [
            1995,
            2000,
            2003,
            2005,
            2007,
            2009,
            2010,
            2011,
            2013,
            2015
        ]

        const types = [
            'ENROLL',
            'TOTAL_REVENUE',
            'TOTAL_EXPENDITURE',
            'INSTR_EXP_DIV_ENROLL'
        ]

        const statements = [' students were enrolled', ' dollars were put into social programs', ' dollars were collected']

        function legendWrapper(type) {
            let property
            let color
            let layer
            if (type == 0) { //enroll
                property = [
                    500000,
                    1000000,
                    1500000,
                    2000000
                ];
                color = [
                    '#feedde',
                    '#fdbe85',
                    '#fd8d3c',
                    '#e6550d',
                    '#a63603'
                ]
                layer = [
                    '0-500',
                    '501-1000',
                    '1001-1500',
                    '1501-2000',
                    '>20000'
                ]
            } else if (type == 1) {
                property = [
                    7000000,
                    14000000,
                    21000000,
                    28000000
                ];
                color = [
                    '#feedde',
                    '#fdbe85',
                    '#fd8d3c',
                    '#e6550d',
                    '#a63603'
                ];
                layer = [
                    '0-7',
                    '8-14',
                    '15-21',
                    '22-28',
                    '>28'
                ];
            } else {
                property = [
                    7000000,
                    14000000,
                    21000000,
                    28000000
                ];
                color = [
                    '#feedde',
                    '#fdbe85',
                    '#fd8d3c',
                    '#e6550d',
                    '#a63603'
                ];
                layer = [
                    '0-7',
                    '8-14',
                    '15-21',
                    '22-28',
                    '>28'
                ];
            }
            let result = [property, color, layer];
            return result;
        }

        function filterBy() {
            let index1 = document.getElementById('slider').value;
            let year = years[index1];
            let index2 = document.getElementById('types').value;
            let type = types[index2];
            let column = 'e_' + String(year) + '_' + type;
            let property = []
            let number = legendWrapper(index2)[0];
            let color = legendWrapper(index2)[1]
            console.log(number)
            property.push('step');
            property.push(['get', column]);
            for (let i = 0; i < 4; i++) {
                property.push(color[i]);
                property.push(number[i]);
            };
            property.push(color[4]);
            map.setPaintProperty('enrollData-layer', 'fill-color', property);
            document.getElementById('year').textContent = year;
        }

        function legendMaker(){
            let type = document.getElementById('types').value;
            const layers = legendWrapper(type)[2];
            const colors = legendWrapper(type)[1];
            const legend = document.getElementById('legend');
            legend.innerHTML = '';
            let title = document.createElement('h2');
            if (type == 0) {
                title.textContent = 'Enrollment Number (Thousands)'
            } else if (type == 1) {
                title.textContent = 'Total Expenditure (millions)'
            } else if (type == 2) {
                title.textContent = 'Total Revenue (millions)'
            }
            legend.appendChild(title);
            layers.forEach((layer, i) => {
                const color = colors[i];
                const item = document.createElement('div');
                const key = document.createElement('span');
                key.className = 'legend-key';
                key.style.backgroundColor = color;

                const value = document.createElement('span');
                value.innerHTML = `${layer}`;
                item.appendChild(key);
                item.appendChild(value);
                legend.appendChild(item);
            });
        }
        async function geojsonFetch() {
            let response = await fetch('assets/sorted_enroll.geojson');
            let enrollData = await response.json();

            map.on('load', function loadingData() {
                map.addSource('enrollData', {
                    type: 'geojson',
                    data: enrollData
                });

                map.addLayer({
                    'id': 'enrollData-layer',
                    'type': 'fill',
                    'source': 'enrollData',
                    'paint': {
                        'fill-color': [
                            'step',
                            ['get', 'e_1995_ENROLL'],
                            '#feedde',
                            500000,
                            '#fdbe85',
                            1000000,
                            '#fd8d3c',
                            1500000,
                            '#e6550d',
                            2000000,
                            '#a63603'
                        ],
                        'fill-outline-color': '#041C32',
                        'fill-opacity': 0.6,
                    }
                });
                legendMaker()
            });
            filterBy();

            document.getElementById('slider').addEventListener('input', () => {
                filterBy();
            });
            document.getElementById('types').addEventListener('input', () => {
                filterBy();
                legendMaker()
            });

            map.on('mousemove', ({
                point
            }) => {
                const enroll = map.queryRenderedFeatures(point, {
                    layers: ['enrollData-layer']
                });
                let index1 = document.getElementById('slider').value;
                let year = years[index1];
                let index2 = document.getElementById('types').value;
                let type = types[index2];
                let column = 'e_' + String(year) + '_' + type;

                document.getElementById('text-description').innerHTML = enroll.length ?
                    `<h3>${enroll[0].properties.NAME}</h3><p><strong><em>${enroll[0].properties[column]}</strong>${statements[index2]}</em></p>` :
                    `<p>Hover over a State!</p>`;
            });
        }

        geojsonFetch();
    }
})();