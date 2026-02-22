import { AuthConfig } from '../../config';

export interface AuthPageProps {
    authConfig: AuthConfig;
}

export const getWithAuthConfig =
    <P extends AuthPageProps>(higerProps: P) =>
    (Component: (props: P & { params: Promise<any>; searchParams: Promise<any> }) => Promise<unknown> | unknown) => {
        return async function WithAuthConfigWrapper(props: P & { params: Promise<any>; searchParams: Promise<any> }) {
            return await Component({ ...props, ...higerProps });
        };
    };
