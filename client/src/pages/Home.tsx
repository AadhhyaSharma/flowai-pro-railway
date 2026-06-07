import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Workflow, Zap, Sparkles } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-accent" />
          <p className="text-sm text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-secondary">
              <Workflow className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">FlowAI Pro</span>
          </div>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-20">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, #ff8c00 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        
        <div className="relative z-10 max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-sm text-accent">
            <Sparkles className="h-4 w-4" />
            Workflow Automation Platform
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight">
            Automate workflows
            <br />
            <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              with AI at the core
            </span>
          </h1>

          <p className="mb-8 text-lg text-muted">
            Build powerful automation workflows visually. Connect AI models, APIs, databases, and messaging apps — no code required.
          </p>

          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="gap-2 bg-accent hover:bg-accent/90"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              <Zap className="h-4 w-4" />
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              Sign In
            </Button>
          </div>

          {/* Features */}
          <div className="mt-20 grid gap-8 sm:grid-cols-3">
            {[
              { icon: Workflow, title: 'Visual Editor', desc: 'Drag-and-drop workflow builder' },
              { icon: Zap, title: 'AI Powered', desc: 'Built-in Gemini AI integration' },
              { icon: Sparkles, title: 'Production Ready', desc: 'Deploy and scale instantly' },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-lg border border-border bg-card/50 p-6">
                  <Icon className="mb-3 h-6 w-6 text-accent" />
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
