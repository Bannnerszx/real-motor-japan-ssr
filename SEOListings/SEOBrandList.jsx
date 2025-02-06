export default function SEOBrandList({ logos }) {
    return (
        <div style={{ display: 'none' }}>
            <ul>
                {logos.map((logo) => (
                    <li key={logo.id}>
                        <span>{logo.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
