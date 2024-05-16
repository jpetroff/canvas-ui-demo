import * as React from 'react'
import { Card, Box, Text, Flex, TextField, CardProps } from '@radix-ui/themes'

interface ITestForm extends CardProps {
}

const TestForm: React.FunctionComponent<ITestForm> = (props) => {

  return (
    <Card {...props}>
      <Flex gap="2" align="center">
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
};

export default TestForm;