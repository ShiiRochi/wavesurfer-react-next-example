'use client';
import Link from "next/link";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import { WaveSurfer, WaveForm, Region, Marker } from "wavesurfer-react";
import { WaveSurfer as WaveSurferRef } from "wavesurfer-react/dist/utils/createWavesurfer";
// @ts-ignore
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
// @ts-ignore
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline";

import styles from "./Player.module.css";

/**
 * @param min
 * @param max
 * @returns {*}
 */
function generateNum(min: number, max: number) {
    return Math.random() * (max - min + 1) + min;
}

/**
 * @param distance
 * @param min
 * @param max
 * @returns {([*, *]|[*, *])|*[]}
 */
function generateTwoNumsWithDistance(distance: number, min: number, max: number) {
    const num1 = generateNum(min, max);
    const num2 = generateNum(min, max);
    // if num2 - num1 < 10
    if (num2 - num1 >= 10) {
        return [num1, num2];
    }
    return generateTwoNumsWithDistance(distance, min, max);
}

export default function Player() {
    const [timelineVis, setTimelineVis] = useState<boolean>(false);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    const [markers, setMarkers] = useState<Array<any>>([
        {
            id: 1,
            time: 5.5,
            label: "V1",
            color: "#ff990a",
            draggable: true
        },
        {
            id: 2,
            time: 10,
            label: "V2",
            color: "#00ffcc",
            position: "top"
        }
    ]);

    const plugins = useMemo<any[]>(() => {
        return [
            {
                key: "regions",
                plugin: RegionsPlugin,
                options: { dragSelection: true }
            },
            timelineVis && {
                key: "top-timeline",
                plugin: TimelinePlugin,
                options: {
                    height: 20,
                    insertPosition: 'beforebegin',
                    style: {
                        color: '#2D5B88',
                    }
                }
            },
            timelineVis && {
                key: "bottom-timeline",
                plugin: TimelinePlugin,
                options: {
                    height: 10,
                    style: {
                        color: '#6A3274',
                    }
                }
            }
        ].filter(Boolean);
    }, [timelineVis]);

    const toggleTimeline = useCallback(() => {
        setTimelineVis(!timelineVis);
    }, [timelineVis]);

    const [regions, setRegions] = useState<Array<any>>([
        {
            id: "region-1",
            start: 0.5,
            end: 10,
            color: "rgba(0, 0, 0, .5)",
            data: {
                systemRegionId: 31
            }
        },
        {
            id: "region-2",
            start: 5,
            end: 25,
            color: "rgba(225, 195, 100, .5)",
            data: {
                systemRegionId: 32
            }
        },
        {
            id: "region-3",
            start: 15,
            end: 35,
            color: "rgba(25, 95, 195, .5)",
            data: {
                systemRegionId: 33
            }
        }
    ]);

    // use regions ref to pass it inside useCallback
    // so it will use always the most fresh version of regions list
    const regionsRef = useRef(regions);

    useEffect(() => {
        regionsRef.current = regions;
    }, [regions]);

    const regionCreatedHandler = useCallback(
        (region: any) => {
            console.log("region-created --> region:", region);

            if (region.data.systemRegionId) return;

            setRegions([
                ...regionsRef.current,
                { ...region, data: { ...region.data, systemRegionId: -1 } }
            ]);
        },
        [regionsRef]
    );

    const wavesurferRef = useRef<WaveSurferRef | null>(null);

    const handleWSMount = useCallback(
        (waveSurfer: WaveSurferRef | null) => {
            console.log({ waveSurfer });

            wavesurferRef.current = waveSurfer;

            if (wavesurferRef.current) {
                wavesurferRef.current.load("https://storage.yandexcloud.net/wavesurfer-react/bensound-ukulele.mp3");

                // @ts-ignore
                wavesurferRef.current.on("region-created", regionCreatedHandler);

                wavesurferRef.current.on("ready", () => {
                    console.log("WaveSurfer is ready");
                    setIsLoaded(true);
                });

                // @ts-ignore
                wavesurferRef.current.on("region-removed", (region) => {
                    console.log("region-removed --> ", region);
                });

                wavesurferRef.current.on("loading", (data) => {
                    console.log("loading --> ", data);
                });

                if (window) {
                    // @ts-ignore
                    window.surferidze = wavesurferRef.current;
                }
            }
        },
        [regionCreatedHandler]
    );

    const generateRegion = useCallback(() => {
        if (!wavesurferRef.current) return;
        const minTimestampInSeconds = 0;
        const maxTimestampInSeconds = wavesurferRef.current.getDuration();
        const distance = generateNum(0, 10);
        const [min, max] = generateTwoNumsWithDistance(
            distance,
            minTimestampInSeconds,
            maxTimestampInSeconds
        );

        const r = generateNum(0, 255);
        const g = generateNum(0, 255);
        const b = generateNum(0, 255);

        setRegions([
            ...regions,
            {
                id: `custom-${generateNum(0, 9999)}`,
                start: min,
                end: max,
                color: `rgba(${r}, ${g}, ${b}, 0.5)`
            }
        ]);
    }, [regions, wavesurferRef]);

    const generateMarker = useCallback(() => {
        if (!wavesurferRef.current) return;

        const minTimestampInSeconds = 0;
        const maxTimestampInSeconds = wavesurferRef.current.getDuration();
        const distance = generateNum(0, 10);
        const [min] = generateTwoNumsWithDistance(
            distance,
            minTimestampInSeconds,
            maxTimestampInSeconds
        );

        const r = generateNum(0, 255);
        const g = generateNum(0, 255);
        const b = generateNum(0, 255);

        setMarkers([
            ...markers,
            {
                label: `custom-${generateNum(0, 9999)}`,
                time: min,
                color: `rgba(${r}, ${g}, ${b}, 0.5)`
            }
        ]);
    }, [markers, wavesurferRef]);

    const removeLastRegion = useCallback(() => {
        let nextRegions = [...regions];

        nextRegions.pop();

        setRegions(nextRegions);
    }, [regions]);

    const removeLastMarker = useCallback(() => {
        let nextMarkers = [...markers];

        nextMarkers.pop();

        setMarkers(nextMarkers);
    }, [markers]);

    const shuffleLastMarker = useCallback(() => {
        setMarkers((prev) => {
            const next = [...prev];
            let lastIndex = next.length - 1;

            const minTimestampInSeconds = 0;
            const maxTimestampInSeconds = wavesurferRef.current?.getDuration();
            const distance = generateNum(0, 10);
            const [min] = generateTwoNumsWithDistance(
                distance,
                minTimestampInSeconds,
                maxTimestampInSeconds as number
            );

            next[lastIndex] = {
                ...next[lastIndex],
                time: min
            };

            return next;
        });
    }, []);

    const play = useCallback(() => {
        wavesurferRef.current?.playPause();
    }, []);

    const handleRegionUpdate = useCallback((region: any, smth: any) => {
        console.log("region-update-end --> region:", region);
        console.log(smth);
    }, []);

    const handleMarkerUpdate = useCallback((marker: any, smth: any) => {
        console.log("region-update-end --> marker:", marker);
        console.log(smth);
    }, []);

    const setZoom50 = () => {
        wavesurferRef.current?.zoom(50);
    };

    const resetZoom = () => {
        wavesurferRef.current?.zoom(0);
    };

    // @ts-ignore
    return (
        <div>
            <WaveSurfer backend="WebAudio" onMount={handleWSMount} container="#waveform" plugins={plugins}>
                <WaveForm>
                    {isLoaded && regions.map((regionProps) => (
                        <Region
                            onUpdateEnd={handleRegionUpdate}
                            key={regionProps.id}
                            {...regionProps}
                        />
                    ))}
                    {isLoaded && markers.map(markerProps => (
                        <Marker
                            id={markerProps.id}
                            key={markerProps.id}
                            onUpdateEnd={handleMarkerUpdate}
                            start={markerProps.time}
                            color={markerProps.color}
                            content={markerProps.label}
                            drag={markerProps.draggable}
                        />
                    ))}
                </WaveForm>
                <div id="timeline" />
            </WaveSurfer>
            <div className={styles.buttons}>
                <button className={styles.button} onClick={generateRegion}>Generate region</button>
                <button className={styles.button} onClick={generateMarker}>Generate Marker</button>
                <button className={styles.button} onClick={play}>Play / Pause</button>
                <button className={styles.button} onClick={removeLastRegion}>Remove last region</button>
                <button className={styles.button} onClick={removeLastMarker}>Remove last marker</button>
                <button className={styles.button} onClick={shuffleLastMarker}>Shuffle last marker</button>
                <button className={styles.button} onClick={toggleTimeline}>Toggle timeline</button>
                <button className={styles.button} onClick={setZoom50}>zoom 50%</button>
                <button className={styles.button} onClick={resetZoom}>reset zoom</button>
            </div>
            <div className={styles.buttons}>
                <Link className={styles.button} href="/">
                    goto homepage
                </Link>
            </div>
        </div>
    );
};
