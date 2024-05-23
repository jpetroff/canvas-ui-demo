import * as React from 'react'
import { Card, Box, Text, Flex, TextField, CardProps } from '@radix-ui/themes'

interface ITestForm extends CardProps {
}

const TestForm = React.forwardRef<HTMLDivElement, ITestForm> ((props, ref) => {

  return (
    <Card ref={ref} {...props}>
      <Flex direction="column" gap="2">
        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            Name
          </Text>
          <TextField.Root
            defaultValue="Freja Johnsen"
            placeholder="Enter your full name"
          />
        </label>
        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            Email
          </Text>
          <TextField.Root
            defaultValue="freja@example.com"
            placeholder="Enter your email"
          />
        </label>
      </Flex>
    </Card>
    )
});

export default TestForm;