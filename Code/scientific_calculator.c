/* ============================================================
   SCIENTIFIC CALCULATOR  —  C Console Application
   A menu-driven scientific calculator with a colorful,
   box-drawn terminal interface, calculation history, and
   memory functions.

   Compile : gcc scientific_calculator.c -o calculator -lm
   Run     : ./calculator   (or calculator.exe on Windows)
   ============================================================ */

#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>

#ifdef _WIN32
    #include <windows.h>
#endif

/* ---------------- ANSI color / style codes ---------------- */
#define RESET     "\x1b[0m"
#define BOLD      "\x1b[1m"
#define DIM       "\x1b[2m"
#define CYAN      "\x1b[36m"
#define BCYAN     "\x1b[1;36m"
#define GREEN     "\x1b[32m"
#define BGREEN    "\x1b[1;32m"
#define YELLOW    "\x1b[33m"
#define BYELLOW   "\x1b[1;33m"
#define RED       "\x1b[31m"
#define BRED      "\x1b[1;31m"
#define MAGENTA   "\x1b[35m"
#define BMAGENTA  "\x1b[1;35m"
#define BLUE      "\x1b[34m"
#define WHITE     "\x1b[37m"
#define BWHITE    "\x1b[1;37m"

#define MY_PI 3.14159265358979323846
#define MY_E  2.71828182845904523536

#define MAX_HISTORY 8
#define COL_WIDTH   30
#define MENU_WIDTH  (2 * COL_WIDTH + 5)   /* inner width of the menu box  */

/* ---------------- data structures ---------------- */
typedef struct {
    char   expression[64];
    double result;
} HistoryEntry;

static HistoryEntry history[MAX_HISTORY];
static int history_count = 0;
static double memory_value = 0.0;

/* ---------------- small utilities ---------------- */

static void clear_screen(void) {
#ifdef _WIN32
    system("cls");
#else
    system("clear");
#endif
}

static void clear_input_buffer(void) {
    int c;
    while ((c = getchar()) != '\n' && c != EOF) { }
}

static void pause_screen(void) {
    printf(BYELLOW "\n  Press Enter to continue..." RESET);
    getchar();
}

static double get_double(const char *prompt) {
    double val;
    printf(CYAN "  %s" RESET, prompt);
    while (scanf("%lf", &val) != 1) {
        clear_input_buffer();
        printf(BRED "  Invalid number, try again: " RESET);
    }
    clear_input_buffer();
    return val;
}

static long get_int(const char *prompt) {
    long val;
    printf(CYAN "  %s" RESET, prompt);
    while (scanf("%ld", &val) != 1) {
        clear_input_buffer();
        printf(BRED "  Invalid integer, try again: " RESET);
    }
    clear_input_buffer();
    return val;
}

/* horizontal line of a repeated UTF-8 box-drawing char */
static void draw_line(const char *left, const char *mid, const char *right, int width) {
    printf("%s", left);
    for (int i = 0; i < width; i++) printf("%s", mid);
    printf("%s\n", right);
}

/* ---------------- header / menu / result rendering ---------------- */

static void print_header(void) {
    printf(BMAGENTA);
    draw_line("╔", "═", "╗", MENU_WIDTH);
    printf("║%*s║\n", MENU_WIDTH, "");
    const char *title = "S C I E N T I F I C   C A L C U L A T O R";
    int pad = (MENU_WIDTH - (int)strlen(title)) / 2;
    printf("║%*s%s%*s║\n", pad, "", title, MENU_WIDTH - pad - (int)strlen(title), "");
    printf("║%*s║\n", MENU_WIDTH, "");
    draw_line("╚", "═", "╝", MENU_WIDTH);
    printf(RESET "\n");
}

static void print_menu(void) {
    const char *items[] = {
        "1.  Addition",            "2.  Subtraction",
        "3.  Multiplication",      "4.  Division",
        "5.  Modulus (a mod b)",   "6.  Power  (x ^ y)",
        "7.  Square Root",         "8.  Cube Root",
        "9.  Nth Root",            "10. Sine (deg)",
        "11. Cosine (deg)",        "12. Tangent (deg)",
        "13. Log base 10",         "14. Natural Log (ln)",
        "15. Exponential (e^x)",   "16. Factorial",
        "17. Percentage",          "18. View History",
        "19. Memory Functions",    "20. Clear Screen",
        "0.  Exit"
    };
    int n = (int)(sizeof(items) / sizeof(items[0]));

    printf(BCYAN);
    draw_line("╔", "═", "╗", MENU_WIDTH);
    printf(RESET);

    for (int i = 0; i < n; i += 2) {
        printf(BCYAN "║ " RESET GREEN "%-*s" RESET, COL_WIDTH, items[i]);
        printf(BCYAN "│ " RESET);
        if (i + 1 < n)
            printf(GREEN "%-*s" RESET, COL_WIDTH, items[i + 1]);
        else
            printf("%-*s", COL_WIDTH, "");
        printf(BCYAN " ║\n" RESET);
    }

    printf(BCYAN);
    draw_line("╚", "═", "╝", MENU_WIDTH);
    printf(RESET);
}

static void print_result(const char *label, double value) {
    char buf[80];
    snprintf(buf, sizeof(buf), "%s = %.6g", label, value);
    int width = (int)strlen(buf) + 4;
    if (width < 30) width = 30;

    printf("\n" BGREEN);
    draw_line("┌", "─", "┐", width);
    printf("│ " RESET WHITE "%-*s" BGREEN " │\n" RESET, width - 2, buf);
    printf(BGREEN);
    draw_line("└", "─", "┘", width);
    printf(RESET);
}

static void print_error(const char *message) {
    int width = (int)strlen(message) + 4;
    if (width < 30) width = 30;

    printf("\n" BRED);
    draw_line("┌", "─", "┐", width);
    printf("│ " RESET BWHITE "⚠ %-*s" BRED " │\n" RESET, width - 4, message);
    printf(BRED);
    draw_line("└", "─", "┘", width);
    printf(RESET);
}

/* ---------------- history ---------------- */

static void add_history(const char *expr, double result) {
    if (history_count == MAX_HISTORY) {
        for (int i = 1; i < MAX_HISTORY; i++) history[i - 1] = history[i];
        history_count--;
    }
    strncpy(history[history_count].expression, expr, sizeof(history[0].expression) - 1);
    history[history_count].expression[sizeof(history[0].expression) - 1] = '\0';
    history[history_count].result = result;
    history_count++;
}

static void view_history(void) {
    printf("\n" BYELLOW);
    draw_line("╔", "═", "╗", MENU_WIDTH);
    const char *title = "CALCULATION HISTORY";
    int pad = (MENU_WIDTH - (int)strlen(title)) / 2;
    printf("║%*s%s%*s║\n", pad, "", title, MENU_WIDTH - pad - (int)strlen(title), "");
    draw_line("╠", "═", "╣", MENU_WIDTH);
    printf(RESET);

    if (history_count == 0) {
        printf(BYELLOW "║ " RESET "%-*s" BYELLOW " ║\n" RESET, MENU_WIDTH - 2, "  (no calculations yet)");
    } else {
        for (int i = 0; i < history_count; i++) {
            char line[80];
            snprintf(line, sizeof(line), "%s = %.6g", history[i].expression, history[i].result);
            printf(BYELLOW "║ " RESET "%-*s" BYELLOW " ║\n" RESET, MENU_WIDTH - 2, line);
        }
    }
    printf(BYELLOW);
    draw_line("╚", "═", "╝", MENU_WIDTH);
    printf(RESET);
}

/* ---------------- memory submenu ---------------- */

static void memory_menu(void) {
    while (1) {
        printf("\n" BMAGENTA);
        draw_line("╔", "═", "╗", 40);
        printf("║ 1. M+  (add to memory)               ║\n");
        printf("║ 2. M-  (subtract from memory)        ║\n");
        printf("║ 3. MR  (recall memory)               ║\n");
        printf("║ 4. MC  (clear memory)                ║\n");
        printf("║ 0. Back to main menu                 ║\n");
        draw_line("╚", "═", "╝", 40);
        printf(RESET);

        long choice = get_int("Choose an option: ");
        double v;
        switch (choice) {
            case 1:
                v = get_double("Value to add: ");
                memory_value += v;
                print_result("Memory", memory_value);
                pause_screen();
                break;
            case 2:
                v = get_double("Value to subtract: ");
                memory_value -= v;
                print_result("Memory", memory_value);
                pause_screen();
                break;
            case 3:
                print_result("Memory", memory_value);
                pause_screen();
                break;
            case 4:
                memory_value = 0.0;
                printf(GREEN "\n  Memory cleared.\n" RESET);
                pause_screen();
                break;
            case 0:
                return;
            default:
                print_error("Invalid option.");
                pause_screen();
        }
    }
}

/* ---------------- main program ---------------- */

int main(void) {
#ifdef _WIN32
    system("");   /* enables ANSI escape processing on Windows 10+ consoles */
#endif

    long choice;
    double a, b, result;
    char expr[64];

    while (1) {
        clear_screen();
        print_header();
        print_menu();
        printf("\n");
        choice = get_int("Enter your choice: ");

        switch (choice) {
            case 1: /* Addition */
                a = get_double("Enter first number: ");
                b = get_double("Enter second number: ");
                result = a + b;
                snprintf(expr, sizeof(expr), "%.4g + %.4g", a, b);
                print_result(expr, result);
                add_history(expr, result);
                pause_screen();
                break;

            case 2: /* Subtraction */
                a = get_double("Enter first number: ");
                b = get_double("Enter second number: ");
                result = a - b;
                snprintf(expr, sizeof(expr), "%.4g - %.4g", a, b);
                print_result(expr, result);
                add_history(expr, result);
                pause_screen();
                break;

            case 3: /* Multiplication */
                a = get_double("Enter first number: ");
                b = get_double("Enter second number: ");
                result = a * b;
                snprintf(expr, sizeof(expr), "%.4g * %.4g", a, b);
                print_result(expr, result);
                add_history(expr, result);
                pause_screen();
                break;

            case 4: /* Division */
                a = get_double("Enter numerator: ");
                b = get_double("Enter denominator: ");
                if (b == 0.0) {
                    print_error("Division by zero is undefined.");
                } else {
                    result = a / b;
                    snprintf(expr, sizeof(expr), "%.4g / %.4g", a, b);
                    print_result(expr, result);
                    add_history(expr, result);
                }
                pause_screen();
                break;

            case 5: { /* Modulus */
                long ia = get_int("Enter first integer: ");
                long ib = get_int("Enter second integer: ");
                if (ib == 0) {
                    print_error("Modulus by zero is undefined.");
                } else {
                    long r = ia % ib;
                    snprintf(expr, sizeof(expr), "%ld mod %ld", ia, ib);
                    print_result(expr, (double)r);
                    add_history(expr, (double)r);
                }
                pause_screen();
                break;
            }

            case 6: /* Power */
                a = get_double("Enter base: ");
                b = get_double("Enter exponent: ");
                result = pow(a, b);
                snprintf(expr, sizeof(expr), "%.4g ^ %.4g", a, b);
                print_result(expr, result);
                add_history(expr, result);
                pause_screen();
                break;

            case 7: /* Square Root */
                a = get_double("Enter number: ");
                if (a < 0) {
                    print_error("Cannot take square root of a negative number.");
                } else {
                    result = sqrt(a);
                    snprintf(expr, sizeof(expr), "sqrt(%.4g)", a);
                    print_result(expr, result);
                    add_history(expr, result);
                }
                pause_screen();
                break;

            case 8: /* Cube Root */
                a = get_double("Enter number: ");
                result = cbrt(a);
                snprintf(expr, sizeof(expr), "cbrt(%.4g)", a);
                print_result(expr, result);
                add_history(expr, result);
                pause_screen();
                break;

            case 9: /* Nth Root */
                a = get_double("Enter number: ");
                b = get_double("Enter root (n): ");
                if (b == 0) {
                    print_error("Root degree cannot be zero.");
                } else if (a < 0 && fmod(b, 2.0) == 0.0) {
                    print_error("Even root of a negative number is not real.");
                } else {
                    result = (a < 0) ? -pow(-a, 1.0 / b) : pow(a, 1.0 / b);
                    snprintf(expr, sizeof(expr), "%.4g-th root of %.4g", b, a);
                    print_result(expr, result);
                    add_history(expr, result);
                }
                pause_screen();
                break;

            case 10: /* Sine */
                a = get_double("Enter angle in degrees: ");
                result = sin(a * MY_PI / 180.0);
                snprintf(expr, sizeof(expr), "sin(%.4g deg)", a);
                print_result(expr, result);
                add_history(expr, result);
                pause_screen();
                break;

            case 11: /* Cosine */
                a = get_double("Enter angle in degrees: ");
                result = cos(a * MY_PI / 180.0);
                snprintf(expr, sizeof(expr), "cos(%.4g deg)", a);
                print_result(expr, result);
                add_history(expr, result);
                pause_screen();
                break;

            case 12: { /* Tangent */
                a = get_double("Enter angle in degrees: ");
                double cosv = cos(a * MY_PI / 180.0);
                if (fabs(cosv) < 1e-12) {
                    print_error("Tangent is undefined at this angle.");
                } else {
                    result = tan(a * MY_PI / 180.0);
                    snprintf(expr, sizeof(expr), "tan(%.4g deg)", a);
                    print_result(expr, result);
                    add_history(expr, result);
                }
                pause_screen();
                break;
            }

            case 13: /* Log base 10 */
                a = get_double("Enter number: ");
                if (a <= 0) {
                    print_error("Logarithm undefined for non-positive numbers.");
                } else {
                    result = log10(a);
                    snprintf(expr, sizeof(expr), "log10(%.4g)", a);
                    print_result(expr, result);
                    add_history(expr, result);
                }
                pause_screen();
                break;

            case 14: /* Natural log */
                a = get_double("Enter number: ");
                if (a <= 0) {
                    print_error("Natural log undefined for non-positive numbers.");
                } else {
                    result = log(a);
                    snprintf(expr, sizeof(expr), "ln(%.4g)", a);
                    print_result(expr, result);
                    add_history(expr, result);
                }
                pause_screen();
                break;

            case 15: /* Exponential */
                a = get_double("Enter exponent (x for e^x): ");
                result = exp(a);
                snprintf(expr, sizeof(expr), "e^%.4g", a);
                print_result(expr, result);
                add_history(expr, result);
                pause_screen();
                break;

            case 16: { /* Factorial */
                long n = get_int("Enter a non-negative integer: ");
                if (n < 0) {
                    print_error("Factorial undefined for negative numbers.");
                } else if (n > 170) {
                    print_error("Number too large, result would overflow.");
                } else {
                    double f = 1.0;
                    for (long i = 2; i <= n; i++) f *= (double)i;
                    snprintf(expr, sizeof(expr), "%ld!", n);
                    print_result(expr, f);
                    add_history(expr, f);
                }
                pause_screen();
                break;
            }

            case 17: /* Percentage */
                a = get_double("Enter value (x): ");
                b = get_double("Enter percent (y in x%% of): ");
                result = (a / 100.0) * b;
                snprintf(expr, sizeof(expr), "%.4g%% of %.4g", a, b);
                print_result(expr, result);
                add_history(expr, result);
                pause_screen();
                break;

            case 18: /* View History */
                view_history();
                pause_screen();
                break;

            case 19: /* Memory Functions */
                memory_menu();
                break;

            case 20: /* Clear Screen */
                continue;

            case 0: /* Exit */
                clear_screen();
                printf(BMAGENTA);
                draw_line("╔", "═", "╗", 44);
                printf("║   Thank you for using the Calculator! 👋  ║\n");
                draw_line("╚", "═", "╝", 44);
                printf(RESET "\n");
                return 0;

            default:
                print_error("Please choose a valid menu option.");
                pause_screen();
        }
    }

    return 0;
}
