// src/components/ConfigForm.tsx
import '../Styles/PageConfigChart.css';
import { useState } from "react";

const CHART_WINDOW_PERIOD = 'CHART_WINDOW_PERIOD';

export const ChartSettings = () => {
    const [windowPeriod, setWindowPeriod] = useState<number>(
        parseInt(localStorage.getItem(CHART_WINDOW_PERIOD) || '1')
    )

    const handleChange = (newPeriod: number) => {
        localStorage.setItem('CHART_WINDOW_PERIOD', newPeriod.toString())
        setWindowPeriod(newPeriod);
    }

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


            <Title title={'Save .CSV'} />
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

const Value = ({ value }: { value?: string }) => {
    return (
        <div className={`span-six-chart chart-value`}>
            {value}
        </div>
    )
};
