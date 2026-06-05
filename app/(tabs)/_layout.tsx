import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Theme } from '../../constants/Colors';
import { NativeTabs, Icon, Label, VectorIcon } from 'expo-router/unstable-native-tabs';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const colors = Theme[colorScheme as keyof typeof Theme];

  return (
     <NativeTabs
        backgroundColor={colors.card}
        tintColor={colors.brand}
        indicatorColor={colors.brand}
        iconColor={{
          default: colors.textSecondary,
          selected: colors.text,
        }}
        labelStyle={{
          default: { color: colors.textSecondary },
          selected: { color: colors.text },
        }}
     >
      <NativeTabs.Trigger name="Home">
        <Label>Home</Label>
        <Icon 
          sf={{ default: 'house', selected: 'house.fill' }} 
          androidSrc={<VectorIcon family={MaterialIcons} name="home" />}
        />
      </NativeTabs.Trigger>
      {/* <NativeTabs.Trigger name="Stats">
        <Icon 
          sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} 
          androidSrc={<VectorIcon family={MaterialIcons} name="bar-chart" />}
        />
        <Label>Stats</Label>
      </NativeTabs.Trigger> */}
      <NativeTabs.Trigger name="History">
        <Icon 
          sf={{ default: 'clock', selected: 'clock.fill' }} 
          androidSrc={<VectorIcon family={MaterialIcons} name="access-time" />}
        />
        <Label>History</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="Logs">
        <Icon 
          sf={{ default: 'terminal', selected: 'terminal.fill' }} 
          androidSrc={<VectorIcon family={MaterialIcons} name="terminal" />}
        />
        <Label>Logs</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}