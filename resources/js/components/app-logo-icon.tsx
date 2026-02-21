import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <img src="/favicon.svg" alt="App Logo" {...props} />
    );
}
