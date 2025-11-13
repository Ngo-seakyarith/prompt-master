"use client"

import { ExternalLink } from "lucide-react";
import { getAIModel } from "@/lib/aiModels";

interface AIModelLinkProps {
  modelName: string;
  children?: React.ReactNode;
  className?: string;
}

export function AIModelLink({ modelName, children, className = "" }: AIModelLinkProps) {
  const model = getAIModel(modelName);
  
  if (!model) {
    return <span>{children || modelName}</span>;
  }
  
  return (
    <a 
      href={model.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`inline-flex items-center text-primary hover:text-primary/80 underline font-medium transition-colors ${className}`}
      title={`Visit ${model.name} by ${model.company} - ${model.description}`}
      data-testid={`ai-model-link-${model.name.toLowerCase()}`}
    >
      {children || modelName}
      <ExternalLink className="w-3 h-3 ml-1" />
    </a>
  );
}

// Component to render text with AI model links
interface TextWithAILinksProps {
  text: string;
  className?: string;
}

export function TextWithAILinks({ text, className = "" }: TextWithAILinksProps) {
  const renderTextWithLinks = (inputText: string) => {
    const components: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Find all AI model mentions
    const modelNames = ['ChatGPT', 'Gemini', 'Copilot', 'Claude', 'Grok', 'DeepSeek', 'Perplexity'];
    const matches: { start: number; end: number; name: string }[] = [];
    
    modelNames.forEach(modelName => {
      const regex = new RegExp(`\\b(${modelName})\\b`, 'gi');
      let match;
      while ((match = regex.exec(inputText)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          name: match[0]
        });
      }
    });
    
    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);
    
    // Build components array
    matches.forEach((match, index) => {
      // Add text before this match
      if (match.start > lastIndex) {
        components.push(inputText.slice(lastIndex, match.start));
      }
      
      // Add the AI model link
      components.push(
        <AIModelLink key={`${match.name}-${index}`} modelName={match.name}>
          {match.name}
        </AIModelLink>
      );
      
      lastIndex = match.end;
    });
    
    // Add remaining text
    if (lastIndex < inputText.length) {
      components.push(inputText.slice(lastIndex));
    }
    
    return components.length > 0 ? components : [inputText];
  };
  
  return (
    <span className={className}>
      {renderTextWithLinks(text)}
    </span>
  );
}
