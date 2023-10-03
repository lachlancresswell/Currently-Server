// src/components/ConfigForm.tsx
import '../Styles/PageConfigChart.css';
import { useState } from "react";
import { Phase, collectData } from './PageChart';
import { mockPollRange } from '../Hooks/neighbourDataContext';

const CHART_WINDOW_PERIOD = 'CHART_WINDOW_PERIOD';

const downloadPhasesAsCsv = (phases: Phase[], filename: string) => {
    let csv = 'Time,Phase1V,Phase1C,Phase2V,Phase2C,Phase3V,Phase3C\n';
    for (let tick = 0; tick < phases[0].voltage.length; tick += 1) {
        let line = '';
        const time = phases[0].voltage[tick].x;
        line = `${time}`;
        for (let phaseIndex = 0; phaseIndex < 3; phaseIndex += 1) {
            const phase = phases[phaseIndex];
            const voltage = phase.voltage[tick].y;
            const amperage = phase.amperage[tick].y;
            line += `,${voltage},${amperage}`;
        }
        line += '\n';
        csv += line;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export const ChartSettings = () => {
    const [windowPeriod, setWindowPeriod] = useState<number>(
        parseInt(localStorage.getItem(CHART_WINDOW_PERIOD) || '1')
    )

    const handleChange = (newPeriod: number) => {
        localStorage.setItem('CHART_WINDOW_PERIOD', newPeriod.toString())
        setWindowPeriod(newPeriod);
    }

    const handleDownload = () => {
        const hostUrl = window.location.protocol + '//' + window.location.host;
        const databaseUrl = hostUrl + '/influx'
        collectData(hostUrl, databaseUrl).then((res) => {
        }, (text) => {
            const phases = mockPollRange();
            downloadPhasesAsCsv(phases, 'phases.csv');
        })
    };

    return (
        <div className={`chart-container`}>
            <div>
                <Title title={'Window Period'} />
                <div className={`chart-value`}>
                    <span className={`chart-item ${windowPeriod === 30 ? ' chart-selected' : 'chart-not-selected'}`} onClick={() => handleChange(30)}>30s</span>
                    <span className={`chart-item ${windowPeriod === 60 ? ' chart-selected' : 'chart-not-selected'}`} onClick={() => handleChange(60)}>1m</span>
                    <span className={`chart-item ${windowPeriod === 300 ? ' chart-selected' : 'chart-not-selected'}`} onClick={() => handleChange(300)}>5m</span>
                    <span className={`chart-item ${windowPeriod === 600 ? ' chart-selected' : 'chart-not-selected'}`} onClick={() => handleChange(600)}>10m</span>
                    <span className={`chart-item ${windowPeriod === 3600 ? ' chart-selected' : 'chart-not-selected'}`} onClick={() => handleChange(3600)}>1h</span>
                </div>
            </div>

            <button className="save-csv-button" onClick={handleDownload}>
                Save .csv
            </button>

        </div>
    )
}

const Title = ({ title }: { title?: string }) => {
    return (
        <div className={`chart-title`}>
            {title}
        </div>
    )
}