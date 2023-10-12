export const ArrowRight = ({ onClick }: { onClick?: React.MouseEventHandler; }) => {
    return <Arrow onClick={onClick} text='▶' />;
};
export const ArrowLeft = ({ onClick }: { onClick?: React.MouseEventHandler; }) => {
    return <Arrow onClick={onClick} text='◀' />;
};
export const ArrowUp = ({ onClick }: { onClick?: React.MouseEventHandler; }) => {
    return <Arrow onClick={onClick} text='⬆' />;
};
export const ArrowDown = ({ onClick }: { onClick?: React.MouseEventHandler; }) => {
    return <Arrow onClick={onClick} text='⬇' />;
};
export const Arrow = ({ onClick, text }: { onClick?: React.MouseEventHandler; text: string; }) => {
    return <button className='span-one-modal modal-button-arrow' onClick={onClick}>{text}</button>;
};
