// src/components/ConfigForm.tsx
import '../Styles/PageConfigVersions.css';

export const VersionSettings = () => {

    return (
        <div className="gridVersions">
            <Title title={'Firmware:'} />
            <Value value={'0.1.23 (beta)'} />
            <Title title={'Available Memory:'} />
            <Value value={'1.1gb'} />
        </div>
    )
}

const Title = ({ title }: { title?: string }) => {
    return (
        <div className={`span-five-versions versions-title`}>
            {title}
        </div>
    )
}

const Value = ({ value }: { value?: string }) => {
    return (
        <div className={`span-five-versions versions-value`}>
            {value}
        </div>
    )
};