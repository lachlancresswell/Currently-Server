import { NeighbourProvider, useNeighbourContext } from './neighbourContext';
import { NeighbourDataProvider, useNeighbourDataContext } from './neighbourDataContext';
import { useEffect, useState } from 'react';
import { PhaseData, Phase } from '../../Types';
import { useParams } from 'react-router-dom';

interface PageBasicProps {
}

export const PageChannel = ({ }: PageBasicProps) => {
    const { selectedNeighbour } = useNeighbourContext();
    const { neighbourData } = useNeighbourDataContext();
    const [selectedPhase, setSelectedPhase] = useState<PhaseData | null>(null);

    let { phase } = useParams();

    const phaseNumber = parseInt(phase!) - 1;

    useEffect(() => {
        if (neighbourData) {
            const PHASE = 1;
            setSelectedPhase({
                voltage: neighbourData.phases[PHASE].voltage!,
                amperage: neighbourData.phases[PHASE].amperage,
                phase: PHASE,
            });
        }
    }, [neighbourData]);

    if (!selectedNeighbour) {
        return null;
    }

    return (
        <div>
            <h1>Phase {phaseNumber} Data for {selectedNeighbour.name}</h1>
            {selectedPhase ? (
                <div>
                    <h2>Voltage:</h2>
                    <ul>
                        <li>
                            {neighbourData?.phases[phaseNumber].voltage}V
                        </li>
                    </ul>
                    <h2>Amperage:</h2>
                    <ul>
                        <li>
                            {neighbourData?.phases[phaseNumber].amperage}A
                        </li>
                    </ul>
                    <h2>pf:</h2>
                    <ul>
                        <li>
                            {neighbourData?.pf}pf
                        </li>
                    </ul>
                    <h2>hz:</h2>
                    <ul>
                        <li>
                            {neighbourData?.hz}hz
                        </li>
                    </ul>
                </div>
            ) : (
                <p>No data available</p>
            )
            }
        </div >
    );
};
