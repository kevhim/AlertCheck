import React, { useState } from 'react';
import {
  MasterWarning,
  SeverityLevel,
  validateMasterWarningStructure,
} from '@alertcheck/verification-core';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { FICTIONAL_PRESETS } from '../data/fictionalPresets';
import {
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Shield,
  Layers,
  Phone,
  FileCheck,
} from 'lucide-react';

interface MasterWarningFormProps {
  warning: MasterWarning;
  onChange: (warning: MasterWarning) => void;
  onProceed: () => void;
}

export const MasterWarningForm: React.FC<MasterWarningFormProps> = ({
  warning,
  onChange,
  onProceed,
}) => {
  const [newArea, setNewArea] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newProhibition, setNewProhibition] = useState('');

  const validation = validateMasterWarningStructure(warning);

  const handlePresetSelect = (presetId: string) => {
    const found = FICTIONAL_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onChange({ ...found.warning });
    }
  };

  const addArea = () => {
    if (newArea.trim() && !warning.affectedAreas.includes(newArea.trim())) {
      onChange({
        ...warning,
        affectedAreas: [...warning.affectedAreas, newArea.trim()],
      });
      setNewArea('');
    }
  };

  const removeArea = (index: number) => {
    onChange({
      ...warning,
      affectedAreas: warning.affectedAreas.filter((_, i) => i !== index),
    });
  };

  const addAction = () => {
    if (newAction.trim()) {
      onChange({
        ...warning,
        requiredActions: [...warning.requiredActions, newAction.trim()],
      });
      setNewAction('');
    }
  };

  const removeAction = (index: number) => {
    onChange({
      ...warning,
      requiredActions: warning.requiredActions.filter((_, i) => i !== index),
    });
  };

  const addProhibition = () => {
    if (newProhibition.trim()) {
      onChange({
        ...warning,
        prohibitedActions: [...warning.prohibitedActions, newProhibition.trim()],
      });
      setNewProhibition('');
    }
  };

  const removeProhibition = (index: number) => {
    onChange({
      ...warning,
      prohibitedActions: warning.prohibitedActions.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Preset Selector Card */}
      <Card
        title="Load Demonstration Scenario (Fictional Data)"
        subtitle="Select a pre-configured fictional emergency event or edit the parameters below"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FICTIONAL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetSelect(preset.id)}
              className="text-left p-3.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-orange-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-slate-200 group-hover:text-orange-400">
                  {preset.name}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {preset.warning.severity}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{preset.description}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Main Master Warning Editor */}
      <Card
        title="Structured Master Warning (Source of Truth)"
        subtitle="Critical factual ground-truth against which all public messages and translations are verified"
        headerAction={
          validation.valid ? (
            <Badge variant="success">Structured Data Valid</Badge>
          ) : (
            <Badge variant="critical">{validation.errors.length} Format Issue(s)</Badge>
          )
        }
      >
        <div className="space-y-5">
          {/* Validation Errors Box if any */}
          {!validation.valid && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-xs text-red-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-red-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                Inconsistent or Missing Master Data:
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {validation.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Row 1: Hazard Type, Severity, Warning ID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Hazard Type *
              </label>
              <input
                type="text"
                value={warning.hazardType}
                onChange={(e) => onChange({ ...warning, hazardType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                placeholder="e.g. Flash Flood, Wildfire"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Severity Level *
              </label>
              <select
                value={warning.severity}
                onChange={(e) => onChange({ ...warning, severity: e.target.value as SeverityLevel })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              >
                <option value="advisory">Advisory (Informational)</option>
                <option value="watch">Watch (Possible Hazard)</option>
                <option value="warning">Warning (Imminent Threat)</option>
                <option value="emergency">Emergency (Extreme Life Hazard)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Warning ID
              </label>
              <input
                type="text"
                value={warning.warningId}
                onChange={(e) => onChange({ ...warning, warningId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-400 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Row 2: Affected Areas */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Affected Geographic Areas / Sectors * (Must not be omitted in any variant)
            </label>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {warning.affectedAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-slate-800 text-slate-200 border border-slate-700"
                >
                  <Layers className="w-3 h-3 text-orange-400" />
                  {area}
                  <button
                    type="button"
                    onClick={() => removeArea(idx)}
                    className="text-slate-400 hover:text-red-400 ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())}
                placeholder="Add area (e.g. River District, Sector 4)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addArea} icon={<Plus className="w-3.5 h-3.5" />}>
                Add Area
              </Button>
            </div>
          </div>

          {/* Row 3: Timestamps & Evacuation Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Issued At (UTC) *
              </label>
              <input
                type="text"
                value={warning.issuedAt}
                onChange={(e) => onChange({ ...warning, issuedAt: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Valid Until (Expiration) *
              </label>
              <input
                type="text"
                value={warning.validUntil}
                onChange={(e) => onChange({ ...warning, validUntil: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Evacuation Deadline (If applicable)
              </label>
              <input
                type="text"
                value={warning.evacuationDeadline || ''}
                onChange={(e) => onChange({ ...warning, evacuationDeadline: e.target.value || null })}
                placeholder="e.g. 18:00 or 6:00 PM"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Row 4: Required Protective Actions */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Required Protective Actions * (Instructions public must follow)
            </label>
            <div className="space-y-1.5 mb-2.5">
              {warning.requiredActions.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    {act}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAction(idx)}
                    className="text-slate-500 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAction())}
                placeholder="Add required action (e.g. Evacuate immediately to designated shelter)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addAction} icon={<Plus className="w-3.5 h-3.5" />}>
                Add Action
              </Button>
            </div>
          </div>

          {/* Row 5: Prohibited Actions & Safety Restrictions */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Prohibited Actions & Restrictions (Must include explicit negative command)
            </label>
            <div className="space-y-1.5 mb-2.5">
              {warning.prohibitedActions.map((prob, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">⛔</span>
                    {prob}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeProhibition(idx)}
                    className="text-slate-500 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newProhibition}
                onChange={(e) => setNewProhibition(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addProhibition())}
                placeholder="Add prohibition (e.g. Do not drive through floodwater)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addProhibition} icon={<Plus className="w-3.5 h-3.5" />}>
                Add Prohibition
              </Button>
            </div>
          </div>

          {/* Row 6: Safety Helpline & Authority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Safety Contact / Helpline
              </label>
              <input
                type="text"
                value={warning.safetyContact || ''}
                onChange={(e) => onChange({ ...warning, safetyContact: e.target.value || null })}
                placeholder="e.g. Emergency Helpline: 1800-555-0199"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Source Authority Reference *
              </label>
              <input
                type="text"
                value={warning.sourceReference}
                onChange={(e) => onChange({ ...warning, sourceReference: e.target.value })}
                placeholder="e.g. National Emergency Operations Center"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">
              Structured version: <strong className="text-slate-200">v{warning.sourceVersion}</strong>
            </span>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={onProceed}
              disabled={!validation.valid}
              icon={<FileCheck className="w-4 h-4" />}
            >
              Generate & Verify Variants →
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
