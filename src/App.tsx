import { useState, useRef, useEffect } from 'react';

interface Tag {
  id: string;
  label: string;
  type: 'operator' | 'logical-operator' | 'function' | 'workflow' | 'crm';
}

interface ContentItem {
  id: string;
  type: 'text' | 'tag';
  value?: string; // for text
  tag?: Tag; // for tag
}

interface FunctionItem {
  label: string;
  title: string;
  description: string;
  example?: string;
  isOperator?: boolean;
  paramCount?: number;
}

const operators: FunctionItem[] = [
  { label: '=', title: 'Equal (=)', description: 'Checks if two values are equal', example: '5 = 5 → true', isOperator: true },
  { label: '!=', title: 'Not Equal (!=)', description: 'Checks if two values are not equal', example: '5 != 3 → true', isOperator: true },
  { label: '>', title: 'Greater Than (>)', description: 'Checks if left value is greater than right value', example: '5 > 3 → true', isOperator: true },
  { label: '>=', title: 'Greater or Equal (>=)', description: 'Checks if left value is greater than or equal to right value', example: '5 >= 5 → true', isOperator: true },
  { label: '<', title: 'Less Than (<)', description: 'Checks if left value is less than right value', example: '3 < 5 → true', isOperator: true },
  { label: '<=', title: 'Less or Equal (<=)', description: 'Checks if left value is less than or equal to right value', example: '5 <= 5 → true', isOperator: true },
  { label: '+', title: 'Add (+)', description: 'Adds two numbers together', example: '5 + 3 → 8', isOperator: true },
  { label: '-', title: 'Subtract (-)', description: 'Subtracts right value from left value', example: '5 - 3 → 2', isOperator: true },
  { label: '*', title: 'Multiply (*)', description: 'Multiplies two numbers', example: '5 * 3 → 15', isOperator: true },
  { label: '/', title: 'Divide (/)', description: 'Divides left value by right value', example: '6 / 3 → 2', isOperator: true },
  { label: '%', title: 'Modulo (%)', description: 'Returns remainder of division', example: '7 % 3 → 1', isOperator: true },
  { label: '^', title: 'Power (^)', description: 'Raises left value to the power of right value', example: '2 ^ 3 → 8', isOperator: true },
  { label: 'and', title: 'Logical AND', description: 'Returns true if both conditions are true', example: 'true and false → false', isOperator: true },
  { label: 'or', title: 'Logical OR', description: 'Returns true if at least one condition is true', example: 'true or false → true', isOperator: true },
];

const generalFunctions: FunctionItem[] = [
  { label: 'Not', title: 'Not(Boolean)', description: 'Inverts a boolean value', example: 'Not(true) → false', paramCount: 1 },
  { label: 'ToNumber', title: 'ToNumber(Value)', description: 'Converts a value to a number', example: 'ToNumber("123") → 123', paramCount: 1 },
  { label: 'ToString', title: 'ToString(Value)', description: 'Converts a value to a string', example: 'ToString(123) → "123"', paramCount: 1 },
  { label: 'IncludesAny', title: 'IncludesAny(Array, Values)', description: 'Checks if array contains any of the specified values', example: 'IncludesAny([1,2,3], [2,5]) → true', paramCount: 2 },
];

const arrayFunctions: FunctionItem[] = [
  { label: 'Count', title: 'Count(Array)', description: 'Counts the number of items that an array variable contains', example: 'Count([1,2,3,4]) → 4', paramCount: 1 },
  { label: 'Intersect', title: 'Intersect(Array1, Array2)', description: 'Returns items that exist in both arrays', example: 'Intersect([1,2,3], [2,3,4]) → [2,3]', paramCount: 2 },
  { label: 'IntersectCount', title: 'IntersectCount(Array1, Array2)', description: 'Counts items that exist in both arrays', example: 'IntersectCount([1,2,3], [2,3,4]) → 2', paramCount: 2 },
  { label: 'IncludesAll', title: 'IncludesAll(Array, Values)', description: 'Checks if array contains all specified values', example: 'IncludesAll([1,2,3], [1,2]) → true', paramCount: 2 },
  { label: 'IncludesAny', title: 'IncludesAny(Array, Values)', description: 'Checks if array contains any of the specified values', example: 'IncludesAny([1,2,3], [3,4]) → true', paramCount: 2 },
];

const timeFunctions: FunctionItem[] = [
  { label: 'InDays', title: 'InDays(Date, Days)', description: 'Checks if a date is within specified number of days', example: 'InDays(Today, 7)', paramCount: 2 },
  { label: 'AddDays', title: 'AddDays(Date, Days)', description: 'Adds specified number of days to a date', example: 'AddDays(Today, 7)', paramCount: 2 },
  { label: 'AddMonths', title: 'AddMonths(Date, Months)', description: 'Adds specified number of months to a date', example: 'AddMonths(Today, 3)', paramCount: 2 },
  { label: 'FormatDate', title: 'FormatDate(Date, Format)', description: 'Formats a date according to specified format', example: 'FormatDate(Today, "YYYY-MM-DD")', paramCount: 2 },
  { label: 'Now', title: 'Now()', description: 'Returns current date and time', example: 'Now()', paramCount: 0 },
  { label: 'Today', title: 'Today()', description: 'Returns current date at midnight', example: 'Today()', paramCount: 0 },
];

interface WorkflowVariable {
  label: string;
  description: string;
  type: string;
}

const candidateDetails: WorkflowVariable[] = [
  { label: 'SMS Consent', description: 'Whether candidate has consented to SMS communications', type: 'Boolean' },
  { label: 'Email Consent', description: 'Whether candidate has consented to email communications', type: 'Boolean' },
];

const screeningQuestions: WorkflowVariable[] = [
  { label: 'Which of these months are you available to work?', description: 'Candidate\'s available months for work', type: 'Multi-select' },
  { label: 'Which days of the week are you available to work?', description: 'Candidate\'s available days of the week', type: 'Multi-select' },
  { label: 'Are you 18 or older?', description: 'Candidate\'s age eligibility', type: 'Boolean' },
  { label: 'Do you have a work permit?', description: 'Whether candidate has work authorization', type: 'Boolean' },
  { label: 'Do you live in Denver, CO?', description: 'Candidate\'s location', type: 'Boolean' },
  { label: 'Are you willing to relocate to another city or state for this position and do you have any restrictions or preferences regarding the location?', description: 'Candidate\'s relocation willingness and preferences', type: 'Boolean' },
];

interface CRMVariable {
  label: string;
  description: string;
  type: string;
}

const crmCandidate: CRMVariable[] = [
  { label: 'Location', description: 'Candidate\'s location', type: 'String' },
  { label: 'Education', description: 'Candidate\'s education level', type: 'String' },
  { label: 'Experience', description: 'Candidate\'s work experience', type: 'String' },
  { label: 'Skills', description: 'Candidate\'s skills', type: 'Array' },
];

const crmJob: CRMVariable[] = [
  { label: 'JobLocation', description: 'Job location', type: 'String' },
  { label: 'StartDate', description: 'Job start date', type: 'Date' },
  { label: 'Salary', description: 'Job salary', type: 'Number' },
  { label: 'JobID', description: 'Job identifier', type: 'String' },
  { label: 'JobCategory', description: 'Job category', type: 'String' },
  { label: 'JobTitle', description: 'Job title', type: 'String' },
  { label: 'HiringManager', description: 'Hiring manager name', type: 'String' },
  { label: 'Recruiter', description: 'Recruiter name', type: 'String' },
  { label: 'JobStatus', description: 'Current job status', type: 'String' },
  { label: 'DaysRequired', description: 'Number of days required', type: 'Number' },
  { label: 'MonthsRequired', description: 'Number of months required', type: 'Number' },
];

const crmOffer: CRMVariable[] = [
  { label: 'OfferDate', description: 'Offer date', type: 'Date' },
  { label: 'OfferStatus', description: 'Current offer status', type: 'String' },
];

function CRMVariableButton({ variable, onClick }: { variable: CRMVariable; onClick?: () => void }) {
  const [showPopover, setShowPopover] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverPosition, setPopoverPosition] = useState<'left' | 'right'>('left');

  useEffect(() => {
    if (showPopover && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - rect.right;
      setPopoverPosition(spaceOnRight > 400 ? 'right' : 'left');
    }
  }, [showPopover]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
        onClick={onClick}
        className="px-2 py-0.5 rounded text-xs bg-[#D8F4F2] text-[#1D3734] border border-transparent hover:border-teal-700 transition-colors"
      >
        {variable.label}
      </button>
      
      {showPopover && (
        <div 
          className={`fixed z-[9999] w-80 bg-white border border-gray-300 rounded-lg shadow-xl p-4 pointer-events-none`}
          style={{
            left: popoverPosition === 'right' && buttonRef.current 
              ? `${buttonRef.current.getBoundingClientRect().right + 8}px`
              : popoverPosition === 'left' && buttonRef.current
              ? `${buttonRef.current.getBoundingClientRect().left - 328}px`
              : 'auto',
            top: buttonRef.current ? `${buttonRef.current.getBoundingClientRect().top}px` : 'auto'
          }}
        >
          <h3 className="font-semibold text-gray-900 mb-2">{variable.label}</h3>
          <p className="text-sm text-gray-600 mb-3">{variable.description}</p>
          <div className="pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-500">Type: </span>
            <span className="text-xs font-medium text-gray-700">{variable.type}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkflowVariableButton({ variable, onClick }: { variable: WorkflowVariable; onClick?: () => void }) {
  const [showPopover, setShowPopover] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverPosition, setPopoverPosition] = useState<'left' | 'right'>('left');

  useEffect(() => {
    if (showPopover && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - rect.right;
      setPopoverPosition(spaceOnRight > 400 ? 'right' : 'left');
    }
  }, [showPopover]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
        onClick={onClick}
        className="px-2 py-0.5 rounded text-xs bg-[#D8F4F2] text-[#1D3734] border border-transparent hover:border-teal-700 transition-colors text-left"
      >
        {variable.label}
      </button>
      
      {showPopover && (
        <div 
          className={`fixed z-[9999] w-80 bg-white border border-gray-300 rounded-lg shadow-xl p-4 pointer-events-none`}
          style={{
            left: popoverPosition === 'right' && buttonRef.current 
              ? `${buttonRef.current.getBoundingClientRect().right + 8}px`
              : popoverPosition === 'left' && buttonRef.current
              ? `${buttonRef.current.getBoundingClientRect().left - 328}px`
              : 'auto',
            top: buttonRef.current ? `${buttonRef.current.getBoundingClientRect().top}px` : 'auto'
          }}
        >
          <h3 className="font-semibold text-gray-900 mb-2">{variable.label}</h3>
          <p className="text-sm text-gray-600 mb-3">{variable.description}</p>
          <div className="pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-500">Type: </span>
            <span className="text-xs font-medium text-gray-700">{variable.type}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function FunctionButton({ item, onClick }: { item: FunctionItem; onClick?: () => void }) {
  const [showPopover, setShowPopover] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverPosition, setPopoverPosition] = useState<'left' | 'right'>('left');

  useEffect(() => {
    if (showPopover && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - rect.right;
      setPopoverPosition(spaceOnRight > 400 ? 'right' : 'left');
    }
  }, [showPopover]);

  const getButtonStyles = () => {
    if (item.isOperator) {
      if (item.label === 'and' || item.label === 'or') {
        return 'bg-orange-100 text-orange-900 hover:border-orange-700';
      }
      return 'bg-[#EAE8FB] text-indigo-900 hover:border-indigo-700';
    }
    return 'bg-gray-100 text-gray-900 hover:border-gray-700';
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
        onClick={onClick}
        className={`px-2 py-0.5 rounded text-xs font-medium border border-transparent transition-colors ${getButtonStyles()}`}
      >
        {item.label}
      </button>
      
      {showPopover && (
        <div 
          className={`fixed z-[9999] w-80 bg-white border border-gray-300 rounded-lg shadow-xl p-4 pointer-events-none`}
          style={{
            left: popoverPosition === 'right' && buttonRef.current 
              ? `${buttonRef.current.getBoundingClientRect().right + 8}px`
              : popoverPosition === 'left' && buttonRef.current
              ? `${buttonRef.current.getBoundingClientRect().left - 328}px`
              : 'auto',
            top: buttonRef.current ? `${buttonRef.current.getBoundingClientRect().top}px` : 'auto'
          }}
        >
          <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
          {item.example && (
            <>
              <hr className="mb-3 border-gray-200" />
              <p className="text-sm bg-white px-2 py-1 rounded text-gray-700">
                {item.example}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'functions' | 'workflow' | 'external'>('functions');
  const [content, setContent] = useState<ContentItem[]>([
    { id: '0', type: 'text', value: '' }
  ]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const addTag = (label: string, type: 'operator' | 'logical-operator' | 'function' | 'workflow' | 'crm', paramCount?: number) => {
    // Insert tag at cursor position
    const newContent = [...content];
    const currentItem = newContent[cursorPosition];
    
    if (currentItem && currentItem.type === 'text') {
      const input = inputRefs.current[currentItem.id];
      const selectionStart = input?.selectionStart || 0;
      const textBefore = (currentItem.value || '').substring(0, selectionStart);
      const textAfter = (currentItem.value || '').substring(selectionStart);
      
      // Check if this is a function (needs parentheses)
      const isFunction = type === 'function';
      
      if (isFunction && paramCount !== undefined) {
        // Create opening tag with (
        const openingTag: Tag = {
          id: `tag-${Date.now()}-${Math.random()}-open`,
          label: `${label}(`,
          type
        };
        const openingTagItem: ContentItem = {
          id: `item-${Date.now()}-${Math.random()}-open`,
          type: 'tag',
          tag: openingTag
        };
        
        // Create closing tag with )
        const closingTag: Tag = {
          id: `tag-${Date.now()}-${Math.random()}-close`,
          label: ')',
          type
        };
        const closingTagItem: ContentItem = {
          id: `item-${Date.now()}-${Math.random()}-close`,
          type: 'tag',
          tag: closingTag
        };
        
        // Create parameter text inputs and comma separators
        const paramItems: ContentItem[] = [];
        const timestamp = Date.now();
        let firstParamId = '';
        
        for (let i = 0; i < paramCount; i++) {
          // Add text input for parameter
          const paramId = `text-${timestamp}-param-${i}`;
          if (i === 0) firstParamId = paramId;
          
          paramItems.push({
            id: paramId,
            type: 'text',
            value: ''
          });
          
          // Add comma separator if not the last parameter
          if (i < paramCount - 1) {
            paramItems.push({
              id: `item-${timestamp}-comma-${i}`,
              type: 'tag',
              tag: {
                id: `tag-${timestamp}-comma-${i}`,
                label: ',',
                type
              }
            });
          }
        }
        
        // Split the text around cursor
        const beforeItem: ContentItem = { id: `text-${Date.now()}-1`, type: 'text', value: textBefore };
        const afterItem: ContentItem = { id: `text-${Date.now()}-2`, type: 'text', value: textAfter };
        
        newContent.splice(cursorPosition, 1, beforeItem, openingTagItem, ...paramItems, closingTagItem, afterItem);
        setContent(newContent);
        setCursorPosition(cursorPosition + 2);
        
        // Focus on the first parameter input
        setTimeout(() => {
          const firstParamInput = inputRefs.current[firstParamId];
          if (firstParamInput) {
            firstParamInput.focus();
            firstParamInput.setSelectionRange(0, 0);
          }
        }, 0);
      } else {
        // Regular tag (operator, workflow, crm)
        const newTag: Tag = {
          id: `tag-${Date.now()}-${Math.random()}`,
          label,
          type
        };
        
        const newTagItem: ContentItem = {
          id: `item-${Date.now()}-${Math.random()}`,
          type: 'tag',
          tag: newTag
        };
        
        // Split the text around cursor
        const beforeItem: ContentItem = { id: `text-${Date.now()}-1`, type: 'text', value: textBefore };
        const afterItem: ContentItem = { id: `text-${Date.now()}-2`, type: 'text', value: textAfter };
        
        newContent.splice(cursorPosition, 1, beforeItem, newTagItem, afterItem);
        setContent(newContent);
        setCursorPosition(cursorPosition + 2);
        
        // Focus on the next input
        setTimeout(() => {
          const nextInput = inputRefs.current[afterItem.id];
          if (nextInput) {
            nextInput.focus();
            nextInput.setSelectionRange(0, 0);
          }
        }, 0);
      }
    }
  };

  const handleInputChange = (itemId: string, newValue: string) => {
    setContent(prev => prev.map(item => 
      item.id === itemId ? { ...item, value: newValue } : item
    ));
    // Update search query with text before cursor
    const currentItem = content[cursorPosition];
    if (currentItem && currentItem.id === itemId) {
      const input = inputRefs.current[itemId];
      if (input) {
        const cursorPos = input.selectionStart || 0;
        const textBeforeCursor = newValue.substring(0, cursorPos);
        // Extract the word right before the cursor
        const match = textBeforeCursor.match(/(\S+)$/);
        setSearchQuery(match ? match[1] : '');
      } else {
        setSearchQuery(newValue);
      }
    }
  };

  const clearCurrentInputAndSearch = () => {
    const currentItem = content[cursorPosition];
    if (currentItem && currentItem.type === 'text') {
      const input = inputRefs.current[currentItem.id];
      if (input) {
        const cursorPos = input.selectionStart || 0;
        const value = currentItem.value || '';
        const textBeforeCursor = value.substring(0, cursorPos);
        const textAfterCursor = value.substring(cursorPos);
        
        // Find where the word before cursor starts
        const match = textBeforeCursor.match(/(\S+)$/);
        if (match) {
          const wordStart = textBeforeCursor.length - match[1].length;
          const newValue = value.substring(0, wordStart) + textAfterCursor;
          
          setContent(prev => prev.map(item => 
            item.id === currentItem.id ? { ...item, value: newValue } : item
          ));
          
          // Set cursor position to where the word was
          setTimeout(() => {
            input.focus();
            input.setSelectionRange(wordStart, wordStart);
          }, 0);
        }
      }
      setSearchQuery('');
    }
  };

  // Get search results across all categories
  const getSearchResults = () => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const results: {
      operators: FunctionItem[];
      functions: FunctionItem[];
      workflow: WorkflowVariable[];
      crm: CRMVariable[];
    } = {
      operators: [],
      functions: [],
      workflow: [],
      crm: []
    };

    // Search operators
    results.operators = operators.filter(op => 
      op.label.toLowerCase().includes(query) || 
      op.title.toLowerCase().includes(query) ||
      op.description.toLowerCase().includes(query)
    );

    // Search all functions
    const allFunctions = [...generalFunctions, ...arrayFunctions, ...timeFunctions];
    results.functions = allFunctions.filter(func => 
      func.label.toLowerCase().includes(query) || 
      func.title.toLowerCase().includes(query) ||
      func.description.toLowerCase().includes(query)
    );

    // Search workflow variables
    results.workflow = [...candidateDetails, ...screeningQuestions].filter(variable => 
      variable.label.toLowerCase().includes(query) ||
      variable.description.toLowerCase().includes(query)
    );

    // Search CRM variables
    results.crm = [...crmCandidate, ...crmJob, ...crmOffer].filter(variable => 
      variable.label.toLowerCase().includes(query) ||
      variable.description.toLowerCase().includes(query)
    );

    return results;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, itemId: string, index: number) => {
    const input = e.currentTarget;
    
    if (e.key === 'ArrowLeft' && input.selectionStart === 0 && input.selectionEnd === 0) {
      // At the start of input, move to previous text input
      if (index > 0) {
        e.preventDefault();
        // Find the previous text input
        for (let i = index - 1; i >= 0; i--) {
          if (content[i].type === 'text') {
            const prevInput = inputRefs.current[content[i].id];
            if (prevInput) {
              prevInput.focus();
              const length = prevInput.value?.length || 0;
              prevInput.setSelectionRange(length, length);
              setCursorPosition(i);
              // Update search query - at end of previous input
              const match = (content[i].value || '').match(/(\S+)$/);
              setSearchQuery(match ? match[1] : '');
            }
            break;
          }
        }
      }
    } else if (e.key === 'ArrowRight' && input.selectionStart === (input.value?.length || 0)) {
      // At the end of input, move to next text input
      if (index < content.length - 1) {
        e.preventDefault();
        // Find the next text input
        for (let i = index + 1; i < content.length; i++) {
          if (content[i].type === 'text') {
            const nextInput = inputRefs.current[content[i].id];
            if (nextInput) {
              nextInput.focus();
              nextInput.setSelectionRange(0, 0);
              setCursorPosition(i);
              // Update search query - at start of next input (no text before cursor)
              setSearchQuery('');
            }
            break;
          }
        }
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Cursor moved within the same input - update search query after a brief delay
      setTimeout(() => {
        const cursorPos = input.selectionStart || 0;
        const textBeforeCursor = (input.value || '').substring(0, cursorPos);
        const match = textBeforeCursor.match(/(\S+)$/);
        setSearchQuery(match ? match[1] : '');
      }, 0);
    } else if (e.key === 'Backspace' && input.selectionStart === 0 && input.selectionEnd === 0) {
      // At the start of input, try to delete previous item
      if (index > 0) {
        e.preventDefault();
        const newContent = [...content];
        const prevItem = newContent[index - 1];
        
        if (prevItem.type === 'tag') {
          // Remove the tag
          newContent.splice(index - 1, 1);
          setContent(newContent);
          setCursorPosition(index - 1);
          
          // Focus on current input after deletion
          setTimeout(() => {
            const currentInput = inputRefs.current[itemId];
            if (currentInput) {
              currentInput.focus();
              currentInput.setSelectionRange(0, 0);
            }
          }, 0);
        } else if (prevItem.type === 'text' && index > 0) {
          // Merge with previous text
          const currentValue = content[index].value || '';
          newContent[index - 1] = { ...prevItem, value: (prevItem.value || '') + currentValue };
          newContent.splice(index, 1);
          setContent(newContent);
          setCursorPosition(index - 1);
          
          const mergePoint = prevItem.value?.length || 0;
          setTimeout(() => {
            const prevInput = inputRefs.current[prevItem.id];
            if (prevInput) {
              prevInput.focus();
              prevInput.setSelectionRange(mergePoint, mergePoint);
            }
          }, 0);
        }
      }
    } else if (e.key === 'Delete' && input.selectionStart === (input.value?.length || 0)) {
      // At the end of input, try to delete next item
      if (index < content.length - 1) {
        e.preventDefault();
        const newContent = [...content];
        const nextItem = newContent[index + 1];
        
        if (nextItem.type === 'tag') {
          // Remove the tag
          newContent.splice(index + 1, 1);
          setContent(newContent);
        } else if (nextItem.type === 'text') {
          // Merge with next text
          const currentValue = content[index].value || '';
          newContent[index] = { ...newContent[index], value: currentValue + (nextItem.value || '') };
          newContent.splice(index + 1, 1);
          setContent(newContent);
        }
      }
    }
  };

  const getTagStyles = (type: Tag['type']) => {
    switch (type) {
      case 'operator':
        return 'bg-[#EAE8FB] text-indigo-900';
      case 'logical-operator':
        return 'bg-orange-100 text-orange-900';
      case 'function':
        return 'bg-gray-100 text-gray-900';
      case 'workflow':
        return 'bg-[#D8F4F2] text-[#1D3734]';
      case 'crm':
        return 'bg-[#D8F4F2] text-[#1D3734]';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputContainerRef.current &&
        !inputContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus on the current cursor position input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      const currentItem = content[cursorPosition];
      if (currentItem && currentItem.type === 'text') {
        setTimeout(() => {
          const input = inputRefs.current[currentItem.id];
          if (input) {
            input.focus();
          }
        }, 0);
      }
    }
  }, [isDropdownOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1"></div>
      <div className="w-[502px] bg-white border-l border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Condition</h2>
        
        <div className="relative">
          <div
            ref={inputContainerRef}
            onClick={(e) => {
              // Only handle clicks on the container itself, not on input fields
              if (e.target === e.currentTarget) {
                setIsDropdownOpen(true);
                const currentItem = content[cursorPosition];
                if (currentItem && currentItem.type === 'text') {
                  const input = inputRefs.current[currentItem.id];
                  if (input) {
                    input.focus();
                  }
                }
              }
            }}
            className="w-full min-h-[40px] p-1 bg-white border border-gray-300 rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-gray-500 focus-within:border-transparent cursor-text flex flex-wrap gap-1 items-center"
          >
            {content.map((item, index) => (
              item.type === 'tag' && item.tag ? (
                <span
                  key={item.id}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${getTagStyles(item.tag.type)}`}
                >
                  {item.tag.label}
                </span>
              ) : (
                <input
                  key={item.id}
                  ref={(el) => { inputRefs.current[item.id] = el; }}
                  type="text"
                  value={item.value || ''}
                  onChange={(e) => handleInputChange(item.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, item.id, index)}
                  onFocus={(e) => {
                    setIsDropdownOpen(true);
                    setCursorPosition(index);
                    // Update search query based on cursor position
                    const cursorPos = e.target.selectionStart || 0;
                    const textBeforeCursor = (item.value || '').substring(0, cursorPos);
                    const match = textBeforeCursor.match(/(\S+)$/);
                    setSearchQuery(match ? match[1] : '');
                  }}
                  onClick={(e) => {
                    // Update search query when clicking to move cursor
                    const cursorPos = e.currentTarget.selectionStart || 0;
                    const textBeforeCursor = (item.value || '').substring(0, cursorPos);
                    const match = textBeforeCursor.match(/(\S+)$/);
                    setSearchQuery(match ? match[1] : '');
                  }}
                  placeholder={content.length === 1 && index === 0 && !item.value ? 'Enter condition...' : ''}
                  className="outline-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
                  style={{ 
                    width: content.length === 1 && index === 0 && !item.value 
                      ? '100%' 
                      : `${Math.max(8, (item.value?.length || 0) * 8 + 8)}px` 
                  }}
                  autoComplete="off"
                />
              )
            ))}
          </div>
          
          {isDropdownOpen && (
            <div 
              ref={dropdownRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
            >
              {/* Tabs and Tab Content - only show when not searching */}
              {!searchQuery.trim() && (
                <>
                  <div className="flex border border-gray-200 rounded-lg m-2 bg-gray-50">
                    <button
                      onClick={() => setActiveTab('functions')}
                      className={`flex-1 h-8 rounded-lg transition-colors flex items-center justify-center ${
                        activeTab === 'functions'
                          ? 'bg-white border border-gray-400'
                          : 'bg-gray-100 hover:bg-gray-50 rounded-none'
                      }`}
                      title="Functions"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_20948_65993)">
                          <path d="M3.8501 10.0625C3.96896 10.4809 4.20861 10.9375 4.83438 10.9375C5.91721 10.9375 6.18795 10.0625 7.0001 7C7.81225 3.9375 8.08299 3.0625 9.1658 3.0625C9.79155 3.0625 10.0313 3.51907 10.1501 3.9375M5.68757 5.90624H9.1658" stroke={activeTab === 'functions' ? '#4B5563' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 0.75C8.67091 0.75 9.84876 0.751276 10.7402 0.871094C11.6102 0.98805 12.0943 1.20568 12.4443 1.55566C12.7943 1.90565 13.012 2.38983 13.1289 3.25977C13.2487 4.15124 13.25 5.32909 13.25 7C13.25 8.6709 13.2487 9.84876 13.1289 10.7402C13.012 11.6102 12.7943 12.0943 12.4443 12.4443C12.0943 12.7943 11.6102 13.012 10.7402 13.1289C9.84876 13.2487 8.6709 13.25 7 13.25C5.32909 13.25 4.15124 13.2487 3.25977 13.1289C2.38983 13.012 1.90565 12.7943 1.55566 12.4443C1.20568 12.0943 0.98805 11.6102 0.871094 10.7402C0.751276 9.84876 0.75 8.67091 0.75 7C0.75 5.32908 0.751277 4.15123 0.871094 3.25977C0.988053 2.38983 1.20568 1.90565 1.55566 1.55566C1.90565 1.20568 2.38983 0.988053 3.25977 0.871094C4.15123 0.751277 5.32908 0.75 7 0.75Z" stroke={activeTab === 'functions' ? '#4B5563' : '#9CA3AF'} strokeWidth="1.5" strokeLinejoin="round"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_20948_65993">
                            <rect width="14" height="14" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </button>
                    <button
                      onClick={() => setActiveTab('workflow')}
                      className={`flex-1 h-8 rounded-lg transition-colors flex items-center justify-center ${
                        activeTab === 'workflow'
                          ? 'bg-white border border-gray-400'
                          : 'bg-gray-100 hover:bg-gray-50 rounded-none'
                      }`}
                      title="Workflow"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={activeTab === 'workflow' ? 'text-gray-600' : 'text-gray-400'}>
                        <rect x="5.25" y="1.75" width="3.5" height="2.5" rx="0.5" />
                        <rect x="1.75" y="8.75" width="3.5" height="2.5" rx="0.5" />
                        <rect x="8.75" y="8.75" width="3.5" height="2.5" rx="0.5" />
                        <path d="M7 4.25v2M4 8.75v-1.5h6v1.5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setActiveTab('external')}
                      className={`flex-1 h-8 rounded-lg transition-colors flex items-center justify-center ${
                        activeTab === 'external'
                          ? 'bg-white border border-gray-400'
                          : 'bg-gray-100 hover:bg-gray-50 rounded-none'
                      }`}
                      title="External"
                    >
                      <svg width="14" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_20948_66010)">
                          <path d="M9.5 1.75H8.40625H8.14375C7.94141 0.751953 7.0582 0 6 0C4.9418 0 4.05859 0.751953 3.85625 1.75H3.59375H2.5C1.53477 1.75 0.75 2.53477 0.75 3.5V12.25C0.75 13.2152 1.53477 14 2.5 14H9.5C10.4652 14 11.25 13.2152 11.25 12.25V3.5C11.25 2.53477 10.4652 1.75 9.5 1.75ZM2.9375 3.0625V3.71875C2.9375 4.08242 3.23008 4.375 3.59375 4.375H6H8.40625C8.76992 4.375 9.0625 4.08242 9.0625 3.71875V3.0625H9.5C9.74063 3.0625 9.9375 3.25938 9.9375 3.5V12.25C9.9375 12.4906 9.74063 12.6875 9.5 12.6875H9.0625C9.0625 11.4789 8.08359 10.5 6.875 10.5H5.125C3.91641 10.5 2.9375 11.4789 2.9375 12.6875H2.5C2.25937 12.6875 2.0625 12.4906 2.0625 12.25V3.5C2.0625 3.25938 2.25937 3.0625 2.5 3.0625H2.9375ZM5.34375 2.1875C5.34375 2.01345 5.41289 1.84653 5.53596 1.72346C5.65903 1.60039 5.82595 1.53125 6 1.53125C6.17405 1.53125 6.34097 1.60039 6.46404 1.72346C6.58711 1.84653 6.65625 2.01345 6.65625 2.1875C6.65625 2.36155 6.58711 2.52847 6.46404 2.65154C6.34097 2.77461 6.17405 2.84375 6 2.84375C5.82595 2.84375 5.65903 2.77461 5.53596 2.65154C5.41289 2.52847 5.34375 2.36155 5.34375 2.1875ZM7.75 7.875C7.75 7.41087 7.56563 6.96575 7.23744 6.63756C6.90925 6.30937 6.46413 6.125 6 6.125C5.53587 6.125 5.09075 6.30937 4.76256 6.63756C4.43437 6.96575 4.25 7.41087 4.25 7.875C4.25 8.33913 4.43437 8.78425 4.76256 9.11244C5.09075 9.44063 5.53587 9.625 6 9.625C6.46413 9.625 6.90925 9.44063 7.23744 9.11244C7.56563 8.78425 7.75 8.33913 7.75 7.875Z" fill={activeTab === 'external' ? '#4B5563' : '#9CA3AF'}/>
                        </g>
                        <defs>
                          <clipPath id="clip0_20948_66010">
                            <rect width="12" height="14" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </button>
                  </div>
                  
                  {/* Tab Content */}
                  <div className="p-4 max-h-96 overflow-y-auto">
                {activeTab === 'functions' && (
                  <div className="space-y-4">
                    {/* Operators Section */}
                    <div>
                      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Operators
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {operators.map((op) => (
                          <FunctionButton
                            key={op.label}
                            item={op}
                            onClick={() => {
                              clearCurrentInputAndSearch();
                              addTag(
                                op.label, 
                                op.label === 'and' || op.label === 'or' ? 'logical-operator' : 'operator'
                              );
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* General Functions Section */}
                    <div>
                      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        General Functions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {generalFunctions.map((func) => (
                          <FunctionButton
                            key={func.label}
                            item={func}
                            onClick={() => {
                              clearCurrentInputAndSearch();
                              addTag(func.label, 'function', func.paramCount);
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Array Functions Section */}
                    <div>
                      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Array Functions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {arrayFunctions.map((func) => (
                          <FunctionButton
                            key={func.label}
                            item={func}
                            onClick={() => {
                              clearCurrentInputAndSearch();
                              addTag(func.label, 'function', func.paramCount);
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Time-Based Functions Section */}
                    <div>
                      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Time-Based Functions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {timeFunctions.map((func) => (
                          <FunctionButton
                            key={func.label}
                            item={func}
                            onClick={() => {
                              clearCurrentInputAndSearch();
                              addTag(func.label, 'function', func.paramCount);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'workflow' && (
                  <div className="space-y-4">
                    {/* Candidate Details Section */}
                    <div>
                      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Candidate Details
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {candidateDetails.map((variable) => (
                          <WorkflowVariableButton
                            key={variable.label}
                            variable={variable}
                            onClick={() => {
                              clearCurrentInputAndSearch();
                              addTag(variable.label, 'workflow');
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Screening Questions Section */}
                    <div>
                      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Screening Questions
                      </h3>
                      <div className="flex flex-col gap-2">
                        {screeningQuestions.map((variable) => (
                          <WorkflowVariableButton
                            key={variable.label}
                            variable={variable}
                            onClick={() => {
                              clearCurrentInputAndSearch();
                              addTag(variable.label, 'workflow');
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'external' && (
                  <div className="space-y-4">
                    {/* CRM Candidate Section */}
                    <div>
                      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Candidate
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {crmCandidate.map((variable) => (
                          <CRMVariableButton
                            key={variable.label}
                            variable={variable}
                            onClick={() => {
                              clearCurrentInputAndSearch();
                              addTag(variable.label, 'crm');
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* CRM Job Section */}
                    <div>
                      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Job
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {crmJob.map((variable) => (
                          <CRMVariableButton
                            key={variable.label}
                            variable={variable}
                            onClick={() => {
                              clearCurrentInputAndSearch();
                              addTag(variable.label, 'crm');
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* CRM Offer Section */}
                    <div>
                      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Offer
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {crmOffer.map((variable) => (
                          <CRMVariableButton
                            key={variable.label}
                            variable={variable}
                            onClick={() => {
                              clearCurrentInputAndSearch();
                              addTag(variable.label, 'crm');
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                  </div>
                </>
              )}

              {/* Search Results View */}
              {searchQuery.trim() && (() => {
                const results = getSearchResults();
                const hasResults = results && (
                  results.operators.length > 0 ||
                  results.functions.length > 0 ||
                  results.workflow.length > 0 ||
                  results.crm.length > 0
                );

                return (
                  <div className="p-4 max-h-96 overflow-y-auto">
                    {!hasResults ? (
                      <div className="text-sm text-gray-500 text-center py-8">
                        No results found for "{searchQuery}"
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Operators Results */}
                        {results.operators.length > 0 && (
                          <div>
                            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              Operators
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {results.operators.map((op) => (
                                <FunctionButton
                                  key={op.label}
                                  item={op}
                                  onClick={() => {
                                    clearCurrentInputAndSearch();
                                    addTag(
                                      op.label, 
                                      op.label === 'and' || op.label === 'or' ? 'logical-operator' : 'operator'
                                    );
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Functions Results */}
                        {results.functions.length > 0 && (
                          <div>
                            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              Functions
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {results.functions.map((func) => (
                                <FunctionButton
                                  key={func.label}
                                  item={func}
                                  onClick={() => {
                                    clearCurrentInputAndSearch();
                                    addTag(func.label, 'function', func.paramCount);
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Workflow Variables Results */}
                        {results.workflow.length > 0 && (
                          <div>
                            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              Workflow Variables
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {results.workflow.map((variable) => (
                                <WorkflowVariableButton
                                  key={variable.label}
                                  variable={variable}
                                  onClick={() => {
                                    clearCurrentInputAndSearch();
                                    addTag(variable.label, 'workflow');
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CRM Variables Results */}
                        {results.crm.length > 0 && (
                          <div>
                            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              CRM Variables
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {results.crm.map((variable) => (
                                <CRMVariableButton
                                  key={variable.label}
                                  variable={variable}
                                  onClick={() => {
                                    clearCurrentInputAndSearch();
                                    addTag(variable.label, 'crm');
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
