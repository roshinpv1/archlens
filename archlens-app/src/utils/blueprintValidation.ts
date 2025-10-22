/**
 * Blueprint File Validation Utilities
 * Provides security and validation checks for uploaded blueprint files
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FileValidationOptions {
  maxSizeBytes: number;
  allowedTypes: string[];
  allowedExtensions: string[];
  scanForMalware: boolean;
  checkContent: boolean;
}

const DEFAULT_OPTIONS: FileValidationOptions = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/svg+xml',
    'text/plain',
    'text/yaml',
    'text/x-yaml',
    'application/json',
    'application/x-yaml',
    'text/x-python',
    'application/x-python-code'
  ],
  allowedExtensions: [
    '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.tf', '.yaml', '.yml', '.json', '.txt',
    '.py', '.sh', '.md', '.dockerfile'
  ],
  scanForMalware: true,
  checkContent: true
};

export class BlueprintValidator {
  private options: FileValidationOptions;

  constructor(options: Partial<FileValidationOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Validate a file for blueprint upload
   */
  async validateFile(file: File): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (file.size > this.options.maxSizeBytes) {
      errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(this.options.maxSizeBytes)})`);
    }

    // Check file type
    if (!this.options.allowedTypes.includes(file.type)) {
      errors.push(`File type '${file.type}' is not allowed. Allowed types: ${this.options.allowedTypes.join(', ')}`);
    }

    // Check file extension
    const extension = this.getFileExtension(file.name);
    if (!this.options.allowedExtensions.includes(extension)) {
      errors.push(`File extension '${extension}' is not allowed. Allowed extensions: ${this.options.allowedExtensions.join(', ')}`);
    }

    // Check for suspicious file names
    if (this.isSuspiciousFileName(file.name)) {
      warnings.push('File name contains potentially suspicious characters');
    }

    // Content validation
    if (this.options.checkContent) {
      const contentValidation = await this.validateFileContent(file);
      errors.push(...contentValidation.errors);
      warnings.push(...contentValidation.warnings);
    }

    // Malware scanning (simulated)
    if (this.options.scanForMalware) {
      const malwareCheck = await this.scanForMalware(file);
      if (!malwareCheck.isClean) {
        errors.push('File failed security scan');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate file content for security and format
   */
  private async validateFileContent(file: File): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const content = await this.readFileContent(file);
      
      // Check for suspicious patterns
      if (this.containsSuspiciousPatterns(content)) {
        errors.push('File content contains potentially malicious patterns');
      }

      // Check for executable code in non-code files
      if (this.containsExecutableCode(file.type, content)) {
        warnings.push('File appears to contain executable code');
      }

      // Validate specific file types
      if (file.type === 'application/json') {
        if (!this.isValidJSON(content)) {
          errors.push('Invalid JSON format');
        }
      }

      if (file.type.includes('yaml')) {
        if (!this.isValidYAML(content)) {
          warnings.push('YAML format may be invalid');
        }
      }

      // Check for embedded scripts
      if (this.containsEmbeddedScripts(content)) {
        warnings.push('File contains embedded scripts');
      }

    } catch (error) {
      errors.push('Unable to read file content for validation');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Simulate malware scanning
   */
  private async scanForMalware(file: File): Promise<{ isClean: boolean; threats: string[] }> {
    // In a real application, this would integrate with a malware scanning service
    // For now, we'll simulate some basic checks
    
    const threats: string[] = [];
    
    // Check for suspicious file signatures
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // Check for executable signatures
    if (this.hasExecutableSignature(uint8Array)) {
      threats.push('Executable file signature detected');
    }
    
    // Check for suspicious content patterns
    const content = new TextDecoder().decode(uint8Array);
    if (this.containsMaliciousPatterns(content)) {
      threats.push('Malicious content patterns detected');
    }
    
    return {
      isClean: threats.length === 0,
      threats
    };
  }

  /**
   * Check if file name is suspicious
   */
  private isSuspiciousFileName(fileName: string): boolean {
    const suspiciousPatterns = [
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.pif$/i,
      /\.com$/i,
      /\.vbs$/i,
      /\.js$/i,
      /\.jar$/i,
      /\.php$/i,
      /\.asp$/i,
      /\.jsp$/i,
      /[<>:"|?*]/,
      /\.\./,
      /^\./
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(fileName));
  }

  /**
   * Check for suspicious content patterns
   */
  private containsSuspiciousPatterns(content: string): boolean {
    const suspiciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /eval\s*\(/gi,
      /document\.write/gi,
      /window\.location/gi,
      /\.innerHTML/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check for executable code in non-code files
   */
  private containsExecutableCode(fileType: string, content: string): boolean {
    if (fileType.startsWith('image/')) {
      const executablePatterns = [
        /<script/gi,
        /javascript:/gi,
        /eval\s*\(/gi
      ];
      return executablePatterns.some(pattern => pattern.test(content));
    }
    return false;
  }

  /**
   * Check for embedded scripts
   */
  private containsEmbeddedScripts(content: string): boolean {
    const scriptPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi
    ];
    
    return scriptPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check for executable file signatures
   */
  private hasExecutableSignature(uint8Array: Uint8Array): boolean {
    // Check for common executable signatures
    const signatures = [
      [0x4D, 0x5A], // PE/DOS executable
      [0x7F, 0x45, 0x4C, 0x46], // ELF executable
      [0xCA, 0xFE, 0xBA, 0xBE], // Java class file
      [0xFE, 0xED, 0xFA, 0xCE], // Mach-O binary
    ];
    
    return signatures.some(signature => 
      signature.every((byte, index) => uint8Array[index] === byte)
    );
  }

  /**
   * Check for malicious content patterns
   */
  private containsMaliciousPatterns(content: string): boolean {
    const maliciousPatterns = [
      /rm\s+-rf/gi,
      /del\s+\/s/gi,
      /format\s+c:/gi,
      /shutdown/gi,
      /reboot/gi,
      /halt/gi,
      /killall/gi,
      /pkill/gi,
      /xargs/gi,
      /wget.*-O.*sh/gi,
      /curl.*\|.*sh/gi
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Validate JSON content
   */
  private isValidJSON(content: string): boolean {
    try {
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate YAML content (basic check)
   */
  private isValidYAML(content: string): boolean {
    // Basic YAML validation - in production, use a proper YAML parser
    const lines = content.split('\n');
    let indentLevel = 0;
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      const currentIndent = line.search(/\S/);
      if (currentIndent < 0) continue;
      
      if (currentIndent > indentLevel + 2) {
        return false; // Invalid indentation
      }
      
      indentLevel = currentIndent;
    }
    
    return true;
  }

  /**
   * Read file content as text
   */
  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Get file extension
   */
  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot === -1 ? '' : fileName.substring(lastDot).toLowerCase();
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Create a blueprint validator with default options
 */
export function createBlueprintValidator(options?: Partial<FileValidationOptions>): BlueprintValidator {
  return new BlueprintValidator(options);
}

/**
 * Quick validation function for common use cases
 */
export async function validateBlueprintFile(file: File): Promise<ValidationResult> {
  const validator = createBlueprintValidator();
  return await validator.validateFile(file);
}
