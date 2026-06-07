import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import DarkLayout from '@/components/DarkLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export default function Settings() {
  const [geminiKey, setGeminiKey] = useState('');
  const [telegramKey, setTelegramKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data: settings } = trpc.settings.get.useQuery();
  const updateMutation = trpc.settings.update.useMutation();

  useEffect(() => {
    if (settings) {
      setGeminiKey(settings.geminiKey || '');
      setTelegramKey(settings.telegramKey || '');
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({
        geminiKey: geminiKey || undefined,
        telegramKey: telegramKey || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DarkLayout
      title="Settings"
      subtitle="Manage API keys and preferences"
      toolbarActions={
        <Button
          className="gap-2 bg-accent hover:bg-accent/90"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      }
    >
      <div className="p-6">
        <div className="max-w-2xl space-y-6">
          {/* API Keys Section */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">API Keys</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Google Gemini API Key
                </label>
                <Input
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="font-mono text-xs"
                />
                <p className="mt-1 text-xs text-muted">
                  Used for AI-powered workflow nodes. Get your key from{' '}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Telegram Bot Token
                </label>
                <Input
                  type="password"
                  placeholder="Enter your Telegram bot token"
                  value={telegramKey}
                  onChange={(e) => setTelegramKey(e.target.value)}
                  className="font-mono text-xs"
                />
                <p className="mt-1 text-xs text-muted">
                  Used for sending Telegram messages. Get your token from{' '}
                  <a
                    href="https://t.me/botfather"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    BotFather
                  </a>
                </p>
              </div>
            </div>
          </Card>

          {/* Preferences Section */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Preferences</h2>
            <p className="text-sm text-muted">
              Additional preferences coming soon.
            </p>
          </Card>
        </div>
      </div>
    </DarkLayout>
  );
}
