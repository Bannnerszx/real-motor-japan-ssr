export default function SEOTypeList({ types }) {
    return (
        <div style={{ display: 'none' }}>
            <ul>
                {types.map((type) => (
                    <li key={type.id}>
                        <span>{type.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
