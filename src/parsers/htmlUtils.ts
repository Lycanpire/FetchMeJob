export const parseHtml = (html: string): Document => {
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
};

export const extractTextContent = (element: Element): string => {
    return element.textContent?.trim() || '';
};

export const extractAttribute = (element: Element, attribute: string): string | null => {
    return element.getAttribute(attribute);
};

export const extractElementsBySelector = (document: Document, selector: string): Element[] => {
    return Array.from(document.querySelectorAll(selector));
};