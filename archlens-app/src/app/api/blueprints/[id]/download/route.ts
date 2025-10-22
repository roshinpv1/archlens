import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const blueprintId = resolvedParams.id;

    // In a real application, you would:
    // 1. Fetch the blueprint from your database
    // 2. Get the actual file from your storage (S3, local filesystem, etc.)
    // 3. Stream the file to the client

    // For now, we'll simulate this with mock data
    const mockBlueprint = {
      id: blueprintId,
      name: 'Sample Blueprint',
      fileName: 'sample-blueprint.tf',
      fileType: 'text/plain',
      fileSize: 1024,
      fileData: `# Sample Terraform Configuration
resource "aws_instance" "example" {
  ami           = "ami-0c02fb55956c7d316"
  instance_type = "t3.micro"

  tags = {
    Name = "ExampleInstance"
  }
}

output "instance_ip" {
  value = aws_instance.example.public_ip
}`
    };

    // Create a response with the file content
    const response = new NextResponse(mockBlueprint.fileData, {
      status: 200,
      headers: {
        'Content-Type': mockBlueprint.fileType,
        'Content-Disposition': `attachment; filename="${mockBlueprint.fileName}"`,
        'Content-Length': mockBlueprint.fileSize.toString(),
        'Cache-Control': 'no-cache',
      },
    });

    return response;
  } catch (error) {
    console.error('Error downloading blueprint:', error);
    return NextResponse.json(
      { error: 'Failed to download blueprint' },
      { status: 500 }
    );
  }
}
