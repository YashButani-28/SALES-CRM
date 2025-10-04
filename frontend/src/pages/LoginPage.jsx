import LoginForm from '../components/LoginForm.jsx';

const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 lg:flex-row lg:items-center">
        <div className="text-center text-white lg:text-left">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Sales CRM</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Powerful insights to grow your sales pipeline.
          </h1>
          <p className="mt-6 text-lg text-slate-300">
            Securely manage your team, roles, and permissions from a single, intuitive platform.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
