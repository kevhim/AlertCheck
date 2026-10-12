import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

describe('App React Component', () => {
  it('renders the header, disclaimer banner, and overview tab', () => {
    render(<App />);

    // Brand and logo
    expect(screen.getAllByText('AlertCheck')[0]).toBeInTheDocument();

    // Disclaimer banner
    expect(
      screen.getByText(/AlertCheck is an automated integrity checking tool and/i)
    ).toBeInTheDocument();

    // Hero title
    expect(
      screen.getByText(/Critical Information Integrity Verifier for Emergency Warnings/i)
    ).toBeInTheDocument();
  });

  it('navigates between workflow tabs when clicked', () => {
    render(<App />);

    // Click on "1. Master Warning" tab
    const editorTabBtn = screen.getByText('1. Master Warning');
    fireEvent.click(editorTabBtn);

    // Should display Master Warning form
    expect(
      screen.getByText(/Structured Master Warning \(Source of Truth\)/i)
    ).toBeInTheDocument();

    // Click on "Test Scenarios & Limitations" tab
    const scenariosTabBtn = screen.getByText('Test Scenarios & Limitations');
    fireEvent.click(scenariosTabBtn);

    expect(
      screen.getByText(/Interactive Demonstration Scenarios/i)
    ).toBeInTheDocument();
  });
});
